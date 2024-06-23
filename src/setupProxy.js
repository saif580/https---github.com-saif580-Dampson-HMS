const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://65.0.67.226:7010',
      changeOrigin: true,
    })
  );
};
