const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const routes = require('./routes/routes');
const connectSocket = require('./websocket/socketConnection');
const path = require('path');

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.use('/api', routes);

// =========================DEPLOYMENT=========================

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
  const __dirname2 = path.join(__dirname1, '/build');
  app.use(express.static(__dirname2));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname2, 'index.html'));
  });
} else {
  app.use('/', (req, res) => {
    res.send('API is running successfully');
  });
}

// =========================DEPLOYMENT=========================

const PORT = process.env.SERVER_PORT || 8080;

const server = app.listen(
  PORT,
  console.log(`Server started on PORT ${PORT}`.yellow.bold)
);

connectSocket(server);
