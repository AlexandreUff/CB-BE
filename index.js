const express = require('express');
const server = express();
const port = 3000;

const uploadRoutes = require('./routes/uploadRoutes')

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