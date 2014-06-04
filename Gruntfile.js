module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      sass : {
        dist : {
          files: {
            './css/common.css':'./css/common.scss',
            './css/popup.css':'./css/popup.scss'
          }
        }
      },
      open : {
        reload : {
          path: 'http://reload.extensions',
          app: 'chrome'
        },
      },
      watch : {
        ext : {
          files: '*',
          tasks: ['open']
        },
        css : {
          files: './css/*.scss',
          tasks: ['sass:dist', 'open']
        }
      }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  // Default task(s).
  grunt.registerTask('default', ['open', 'sass', 'watch']);

};   

