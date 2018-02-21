const httpStatus = require('http-status');
const home = require('../app/controllers/home.controller');
const AuthRoutes = require('../app/routes/auth.route');
const AlertsRoutes = require('../app/routes/alerts.route');
const BitbucketRoutes = require('../app/routes/bitbucket.route');
const ConsulRoutes = require('../app/routes/consul.route');
const CostsRoutes = require('../app/routes/costs.route');
const DroneRoutes = require('../app/routes/drone.route');
const ElasticSearchRoutes = require('../app/routes/elasticsearch.route');
const EventsRoutes = require('../app/routes/events.route');
const KongRoutes = require('../app/routes/kong.route');
const KubernetesRoutes = require('../app/routes/kubernetes.route');
const ProjectsRoutes = require('../app/routes/projects.route');
const MetricsRoutes = require('../app/routes/metrics.route');
const NewsRoutes = require('../app/routes/news.route');
const ProvisionsRoutes = require('../app/routes/provisions.route');
const SiteSpeedRoutes = require('../app/routes/sitespeed.route');
const SonarRoutes = require('../app/routes/sonar.route');
const SwaggerRoutes = require('../app/routes/swagger.route');
const UptimeRoutes = require('../app/routes/uptime.route');
const isUserGuard = require('../app/policies/isUser').isUser;

module.exports = (app) => {

  /** GET /health - Check service health */
  app.get('/health', (req, res) => res.status(httpStatus.OK).send('OK'));

  app.get('/', home.index);

  // mount auth routes at /auth
  app.use('/auth', AuthRoutes);

  // mount alerts routes at /alerts
  app.use('/alerts', isUserGuard, AlertsRoutes);

  // mount bitbucket routes at /consul
  app.use('/bitbucket', isUserGuard, BitbucketRoutes);

  // mount consul routes at /consul
  app.use('/consul', isUserGuard, ConsulRoutes);

  // mount costs routes at /costs
  app.use('/costs', isUserGuard, CostsRoutes);

  // mount drone routes at /drone
  app.use('/drone', isUserGuard, DroneRoutes);

  // mount elasticsearch routes at /elasticsearch
  app.use('/elasticsearch', isUserGuard, ElasticSearchRoutes);

  // mount events routes at /events
  app.use('/events', isUserGuard, EventsRoutes);

  // mount kong routes at /kong
  app.use('/kong', isUserGuard, KongRoutes);

  // mount kubernetes routes at /kubernetes
  app.use('/kubernetes', isUserGuard, KubernetesRoutes);

  // mount projects routes at /projects
  app.use('/projects', isUserGuard, ProjectsRoutes);

  // mount metrics routes at /metrics
  app.use('/metrics', isUserGuard, MetricsRoutes);

  // mount projects routes at /projects
  app.use('/news', isUserGuard, NewsRoutes);

  // mount projects routes at /provisions
  app.use('/provisions', isUserGuard, ProvisionsRoutes);

  // mount sitespeed routes at /sitespeed
  app.use('/sitespeed', isUserGuard, SiteSpeedRoutes);

  // mount sonar routes at /sonar
  app.use('/sonar', isUserGuard, SonarRoutes);

  // mount swagger routes at /swagger
  app.use('/swagger', isUserGuard, SwaggerRoutes);

  // mount uptime routes at /uptimes
  app.use('/uptimes', isUserGuard, UptimeRoutes);

  /**
   * Error handling
   */
  app.use((err, req, res, next) => {
    // treat as 404
    if (err.message &&
      (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);

    // error page
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
  });

  // assume 404 since no middleware responded
  app.use((req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Not Found'
    });
  });
};
