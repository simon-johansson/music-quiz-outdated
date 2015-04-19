
module.exports = (grunt)->

  # load all grunt tasks
  require('load-grunt-tasks')(grunt)

  _ = grunt.util._
  path = require 'path'

  # Project configuration.
  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')

    # coffee:
    #   lib:
    #     expand: true
    #     cwd: 'lib/'
    #     src: ['**/*.coffee']
    #     dest: 'dist/lib'
    #     ext: '.js'
    #   test:
    #     expand: true
    #     cwd: 'test/'
    #     src: ['**/*.coffee']
    #     dest: 'dist/test/'
    #     ext: '.js'

    # copy:
    #   dist:
    #     files: [
    #       expand: true,
    #       cwd: 'test',
    #       dest: 'dist/test/',
    #       src: [
    #         '**/*.json'
    #       ]
    #     ]

    watch:
      options:
        spawn: false
        livereload: true
      # scripts:
      #   files: ['public/bundle.js']
      # markup:
      #   files: ['public/*/**.html']
      # styles:
      #   files: ['public/styles.css']
      scss:
        options:
          livereload: false
        files: ['public/scss/**/*.scss']
        tasks: ['sass']
      express:
        options:
          livereload: true
          nospawn: true
        files: ['server/**/*.coffee']
        tasks: ['express:dev', 'wait']

    express:
      options:
        port: process.env.PORT || 3000
        opts: ['node_modules/coffee-script/bin/coffee']
      dev:
        options:
          script: 'server/index.coffee'
          debug: true

    env:
      dev:
        NODE_ENV: 'development'
      prod:
        NODE_ENV: 'production'

    sass:
      options:
        sourceMap: true
      public:
        files:
          'public/styles.css': 'public/scss/app.scss'

    # clean: ['dist/']

    browserify:
      options:
        transform: ['coffee-reactify', 'reactify']
      compile:
        src: 'public/scripts/index.coffee'
        dest: 'public/bundle.js'
      dev:
        src: '<%= browserify.compile.src %>'
        dest: '<%= browserify.compile.dest %>'
        options:
          watch: true

  grunt.registerTask 'wait', ->
    grunt.log.ok 'Waiting for server reload...'
    done = this.async()
    setTimeout ->
      grunt.log.writeln 'Done waiting!'
      done()
    , 1500


  grunt.registerTask 'default', [
    'browserify:compile'
    'sass'
  ]

  grunt.registerTask 'dev', [
    'env:dev'
    'browserify'
    'sass'
    'express:dev'
    'wait'
    'watch'
  ]
