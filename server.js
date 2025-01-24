const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data');

const app = express();
const port = 3001;

// Enable JSON parsing for request body
app.use(express.json());

// Add this before your routes
app.use(cors());
app.use(express.static('.'));

// Function to get all video files from the videos directory
function getVideoFiles() {
  const videoDir = path.join(__dirname, 'videos');
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
  
  try {
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir);
    }
    
    const files = fs.readdirSync(videoDir);
    return files.filter(file => 
      videoExtensions.includes(path.extname(file).toLowerCase())
    ).map(file => ({
      name: file,
      path: path.join(videoDir, file)
    }));
  } catch (error) {
    console.error('Error reading video directory:', error);
    return [];
  }
}

// Endpoint to get list of videos
app.get('/videos', (req, res) => {
  const videos = getVideoFiles();
  res.json({ videos });
});

async function processOneVideo(videoPath, videoName, model) {
  const videoBuffer = fs.readFileSync(videoPath);
  const formData = new FormData();

  formData.append('model', model);
  formData.append('video', videoBuffer, {
    filename: videoName,
    contentType: 'video/mp4'
  });
  
  const response = await axios.post('http://localhost:3000/api/evaluate', formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  return {
    videoName,
    measurements: response.data
  };
}

app.post('/process-all-videos', async (req, res) => {
  try {
    const videos = getVideoFiles();
    const results = [];
    
    for (const video of videos) {
      try {
        const result = await processOneVideo(video.path, video.name, 'gpt-4o');
        results.push(result);
      } catch (error) {
        results.push({
          videoName: video.name,
          error: error.message
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Error processing videos:', error);
    res.status(500).json({ error: 'Error processing videos', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 