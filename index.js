const express = require('express');
const server = express();
const port = 3000;

const uploadRoutes = require('./routes/uploadRoutes')

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your client-side origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Allow preflight requests to succeed
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

server.get('/', (req, res) => {
  res.send('Hello, Worlds!');
});

//read body
/* server.use(
    express.urlencoded({
        extended: true
    })
);

server.use(express.json()); */

server.use('/upload', uploadRoutes)

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});