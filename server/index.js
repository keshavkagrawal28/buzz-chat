const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const routes = require('./routes/routes');
const connectSocket = require('./websocket/socketConnection');

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 8080;

const server = app.listen(
  PORT,
  console.log(`Server started on PORT ${PORT}`.yellow.bold)
);

connectSocket(server);
