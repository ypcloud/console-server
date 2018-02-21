const httpStatus = require('http-status');
const SwaggerService = require('../services/swagger.service');

/**
 * Get Swagger File
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getSwaggerFile = (req, res, next) => {
  const namespace = req.params.namespace;

  SwaggerService.getSwaggerFile(namespace)
    .then(swagger => {
      res.status(httpStatus.OK).json({
        result: true,
        data: swagger
      });
    })
    .catch(error => {
      console.log('ERROR', error);
      next(new Error('Error getting Swagger file'));
    });
};
