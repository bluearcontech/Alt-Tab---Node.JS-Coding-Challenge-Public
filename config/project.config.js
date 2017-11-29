const path = require('path')

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  dir_app: 'app_client',
  dir_config: 'config',
  dir_dist: 'dist',
  dir_public: 'public',
  dir_server: 'server',
}

config.globals = {
  '__DEV__': config.env === 'development',
  '__PROD__': config.env === 'production',
}

module.exports = config;