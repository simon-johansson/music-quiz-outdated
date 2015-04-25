
module.exports = (grunt) ->
  localConfig = undefined
  try
    localConfig = require './server/config/local.env'
  catch e
    localConfig = {}

  require('load-grunt-tasks')(grunt)

  # Time how long tasks take. Can help when optimizing build times
  require('time-grunt') grunt

  # Define the configuration for all the tasks
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    yeoman:
      client: require('./bower.json').appPath or 'client'
      dist: 'dist'

    express:
      options: port: process.env.PORT or 9000
      dev: options:
        script: 'server/app.js'
        debug: true
      prod: options: script: 'dist/server/app.js'

    open: server: url: 'http://localhost:<%= express.options.port %>'

    watch:
      mochaTest:
        files: [ 'server/**/*.spec.js' ]
        tasks: [
          'env:test'
          'mochaTest'
        ]
      jsTest:
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js'
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
        tasks: [
          'newer:jshint:all'
          'karma'
        ]
      sass:
        files: [ '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}' ]
        tasks: [
          'sass'
          'autoprefixer'
        ]
      # coffee:
      #   files: [
      #     '<%= yeoman.client %>/{app,components}/**/*.{coffee,litcoffee,coffee.md}'
      #     '!<%= yeoman.client %>/{app,components}/**/*.spec.{coffee,litcoffee,coffee.md}'
      #   ]
      #   tasks: [
      #     'newer:coffee'
      #   ]
      # coffeeTest:
      #   files: [ '<%= yeoman.client %>/{app,components}/**/*.spec.{coffee,litcoffee,coffee.md}' ]
      #   tasks: [ 'karma' ]
      gruntfile: files: [ 'Gruntfile.js', 'Gruntfile.coffee' ]
      livereload:
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css'
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html'
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js'
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js'
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js'
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
        options: livereload: true
      express:
        files: [ 'server/**/*.{js,json}' ]
        tasks: [
          'express:dev'
          'wait'
        ]
        options:
          livereload: true
          nospawn: true

    jshint:
      options:
        jshintrc: '<%= yeoman.client %>/.jshintrc'
        reporter: require('jshint-stylish')
      server:
        options: jshintrc: 'server/.jshintrc'
        src: [
          'server/**/*.js'
          '!server/**/*.spec.js'
        ]
      serverTest:
        options: jshintrc: 'server/.jshintrc-spec'
        src: [ 'server/**/*.spec.js' ]
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js'
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js'
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ]
      test: src: [
        '<%= yeoman.client %>/{app,components}/**/*.spec.js'
        '<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ]

    clean:
      dist: files: [{
        dot: true
        src: [
          '.tmp'
          '<%= yeoman.dist %>/*'
          '!<%= yeoman.dist %>/.git*'
        ]
      }]
      server: '.tmp'

    autoprefixer:
      options: browsers: [ 'last 1 version' ]
      dist: files: [{
        expand: true
        cwd: '.tmp/'
        src: '{,*/}*.css'
        dest: '.tmp/'
      }]

    'node-inspector': custom: options: 'web-host': 'localhost'

    nodemon: debug:
      script: 'server/app.js'
      options:
        nodeArgs: [ '--debug-brk' ]
        env: PORT: process.env.PORT or 9000
        callback: (nodemon) ->
          nodemon.on 'log', (event) ->
            console.log event.colour
          # opens browser on initial server start
          nodemon.on 'config:update', ->
            setTimeout (->
              require('open') 'http://localhost:8080/debug?port=5858'
            ), 500

    rev: dist: files: src: [
      '<%= yeoman.dist %>/public/{,*/}*.js'
      '<%= yeoman.dist %>/public/{,*/}*.css'
      '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
      '<%= yeoman.dist %>/public/assets/fonts/*'
    ]

    useminPrepare:
      html: [ '<%= yeoman.client %>/index.html' ]
      options: dest: '<%= yeoman.dist %>/public'

    usemin:
      html: [ '<%= yeoman.dist %>/public/{,*/}*.html' ]
      css: [ '<%= yeoman.dist %>/public/{,*/}*.css' ]
      js: [ '<%= yeoman.dist %>/public/{,*/}*.js' ]
      options:
        assetsDirs: [
          '<%= yeoman.dist %>/public'
          '<%= yeoman.dist %>/public/assets/images'
        ]
        patterns: js: [ [
          /(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm
          'Update the JS to reference our revved images'
        ] ]

    copy:
      dist: files: [
        {
          expand: true
          dot: true
          cwd: '<%= yeoman.client %>'
          dest: '<%= yeoman.dist %>/public'
          src: [
            '*.{ico,png,txt}'
            '.htaccess'
            'bower_components/**/*'
            'assets/images/{,*/}*.{webp}'
            'assets/fonts/**/*'
            'index.html'
          ]
        }
        {
          expand: true
          cwd: '.tmp/images'
          dest: '<%= yeoman.dist %>/public/assets/images'
          src: [ 'generated/*' ]
        }
        {
          expand: true
          dest: '<%= yeoman.dist %>'
          src: [
            'package.json'
            'server/**/*'
          ]
        }
      ]
      styles:
        expand: true
        cwd: '<%= yeoman.client %>'
        dest: '.tmp/'
        src: [ '{app,components}/**/*.css' ]

    concurrent:
      server: [
        'sass'
      ]
      test: [
        'browserify:compile'
        'sass'
      ]
      debug:
        tasks: [
          'nodemon'
          'node-inspector'
        ]
        options: logConcurrentOutput: true
      dist: [
        'browserify:compile'
        'sass'
      ]

    karma: unit:
      configFile: 'karma.conf.js'
      singleRun: true

    mochaTest:
      options: reporter: 'spec'
      src: [ 'server/**/*.spec.js' ]

    env:
      test: NODE_ENV: 'test'
      prod: NODE_ENV: 'production'
      all: localConfig

    coffee:
      options:
        sourceMap: true
        sourceRoot: ''
      server: files: [ {
        expand: true
        cwd: 'client'
        src: [
          '{app,components}/**/*.coffee'
          '!{app,components}/**/*.spec.coffee'
        ]
        dest: '.tmp'
        ext: '.js'
      } ]

    sass: server:
      options:
        loadPath: [
          '<%= yeoman.client %>/bower_components'
          '<%= yeoman.client %>/app'
          '<%= yeoman.client %>/components'
        ]
        compass: false
      files: '.tmp/app/app.css': '<%= yeoman.client %>/app/scss/app.scss'

    browserify:
      options:
        transform: ['coffee-reactify', 'reactify']
        browserifyOptions:
          extensions: ['.coffee', '.cjsx']
      compile:
        src: '<%= yeoman.client %>/app/flux/index.cjsx'
        dest: '.tmp/app/app.js'
      dev:
        src: '<%= browserify.compile.src %>'
        dest: '<%= browserify.compile.dest %>'
        options:
          watch: true
          browserifyOptions:
            extensions: '<%= browserify.options.browserifyOptions.extensions %>'
            debug: true

  # Used for delaying livereload until after server has restarted
  grunt.registerTask 'wait', ->
    grunt.log.ok 'Waiting for server reload...'
    done = @async()
    setTimeout (->
      grunt.log.writeln 'Done waiting!'
      done()
    ), 1500

  grunt.registerTask 'express-keepalive', 'Keep grunt running', ->
    @async()

  grunt.registerTask 'serve', (target) ->
    # if target == 'dist'
    #   return grunt.task.run([
    #     'build'
    #     'env:all'
    #     'env:prod'
    #     'express:prod'
    #     'wait'
    #     'open'
    #     'express-keepalive'
    #   ])
    # if target == 'debug'
    #   return grunt.task.run([
    #     'clean:server'
    #     'env:all'
    #     'injector:sass'
    #     'concurrent:server'
    #     'injector'
    #     'wiredep'
    #     'autoprefixer'
    #     'concurrent:debug'
    #   ])
    grunt.task.run [
      'clean:server'
      'env:all'
      'concurrent:server'
      'browserify:dev'
      'autoprefixer'
      'express:dev'
      'wait'
      'open'
      'watch'
    ]

  grunt.registerTask 'server', ->
    grunt.log.warn 'The `server` task has been deprecated. Use `grunt serve` to start a server.'
    grunt.task.run [ 'serve' ]

  grunt.registerTask 'test', (target) ->
    if target == 'server'
      return grunt.task.run([
        'env:all'
        'env:test'
        'mochaTest'
      ])
    else if target == 'client'
      return grunt.task.run([
        'clean:server'
        'env:all'
        'injector:sass'
        'concurrent:test'
        'injector'
        'autoprefixer'
        'karma'
      ])
    else if target == 'e2e'
      return grunt.task.run([
        'clean:server'
        'env:all'
        'env:test'
        'injector:sass'
        'concurrent:test'
        'injector'
        'wiredep'
        'autoprefixer'
        'express:dev'
        'protractor'
      ])
    else
      grunt.task.run [
        'test:server'
        'test:client'
      ]

  grunt.registerTask 'build', [
    'clean:dist'
    'injector:sass'
    'concurrent:dist'
    'injector'
    'wiredep'
    'useminPrepare'
    'autoprefixer'
    'ngtemplates'
    'concat'
    'ngAnnotate'
    'copy:dist'
    'cdnify'
    'cssmin'
    'uglify'
    'rev'
    'usemin'
  ]

  grunt.registerTask 'default', [
    'newer:jshint'
    'test'
    'build'
  ]
