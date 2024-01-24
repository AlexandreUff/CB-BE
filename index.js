const express = require('express');
const server = express();
const cors = require('cors')
const port = 3000;

const uploadRoutes = require('./routes/uploadRoutes')

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', `${process.env.URL_CLI_PROD}` || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

console.log("ENV:", process.env.URL_CLI_PROD)

/* server.use(cors({
  origin: "*",
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
})); */

server.use(cors())

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

server.use('/upload', cors(), uploadRoutes)

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});