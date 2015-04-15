
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

      scripts:
        files: ['public/bundle.js']

      markup:
        files: ['public/*/**.html']

      styles:
        files: ['public/styles.css']

      scss:
        options:
          livereload: false
        files: ['public/scss/**/*.scss']
        task: 'sass'

    nodemon:
      dev:
        script: 'server/'
        options:
          args: ['']
          nodeArgs: ['']
          env:
            PORT: '8080'
            DEBUG: 'http'

    sass:
      options:
        sourceMap: true
      public:
        files:
          'public/styles.css': 'public/scss/app.scss'

    # clean: ['dist/']

    browserify:
      compile:
        src: 'public/scripts/index.coffee'
        dest: 'public/bundle.js'
        options:
          transform: ['coffeeify']

      dev:
        src: 'public/scripts/index.coffee'
        dest: 'public/bundle.js'
        options:
          watch: true
          transform: ['coffeeify']

  grunt.registerTask 'default', [
    'browserify:compile'
    'sass'
  ]

  grunt.registerTask 'dev', [
    'browserify'
    'watch'
    # 'nodemon'
  ]
