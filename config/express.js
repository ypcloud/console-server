const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const flash = require('connect-flash');
const helpers = require('view-helpers');
const config = require('./');
const pkg = require('../package.json');

const env = process.env.NODE_ENV || 'development';

module.exports = (app) => {

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  // Static files middleware
  app.use(express.static(config.root + '/public'));

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());
  app.options('*', cors());

  // expose package.json to views
  app.use((req, res, next) => {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  // cookieParser should be above session
  app.use(cookieParser());
  app.use(cookieSession({ secret: 'secret' }));

  // connect flash for flash messages - should be declared after sessions
  app.use(flash());

  // should be declared after session and flash
  app.use(helpers(pkg.name));
};
