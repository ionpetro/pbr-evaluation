# pbr-evaluation

1. Make sure you have pbr running on your machine.

2. Start the server with `node server.js`

3. Open the index.html file in your browser.

API DOCUMENTATION

POST http://localhost:3000/api/evaluate

Payload:

```
{
  model: string,
  video: file
}
```

Response:

```
{
  bucks: number,
  kicks: number,
  directionalChanges: number,
  intensity: string,
  difficulty: string
}
```
