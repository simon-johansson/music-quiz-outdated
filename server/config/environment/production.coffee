
# Production specific configuration
# =================================

module.exports =

  ip: process.env.OPENSHIFT_NODEJS_IP or
      process.env.IP or
      undefined

  port: process.env.OPENSHIFT_NODEJS_PORT or
        process.env.PORT or
        8080

  mongo: uri: process.env.MONGOLAB_URI or
              process.env.MONGOHQ_URL or
              process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME or
              'mongodb://localhost/quizify'
