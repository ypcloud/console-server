// inject .env vars
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

const models = path.join(__dirname, 'app/models');
const port = config.port || 3000;

const app = express();
const connection = connectDB();

// Use Bluebird as Mongoose's promise library
mongoose.Promise = require('bluebird');

module.exports = {
  app,
  connection
};

connection
  .on('error', console.log)
  .on('disconnected', connectDB)
  .once('open', createServer);

// Bootstrap routes
require('./config/express')(app);
require('./config/routes')(app);

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(path.join(models, file)));

// Start Cron Jobs
require('./crons/projects.cron')();
require('./crons/metrics.cron')();
require('./crons/api-catalog.cron')();

function createServer () {
  if (process.env.NODE_ENV === 'test') return;

  const server = http.createServer(app);
  require('./config/sockets')(server);

  server.listen(port);
  console.log('Express app started on port', port, 'with NODE_ENV=' + process.env.NODE_ENV);
}

function connectDB () {
  const options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(config.mongo.uri, options).connection;
}
