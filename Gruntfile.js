module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
		
		, concat: {
			options: {
				separator: ';'
			}
			, client_main: {
				src: ['js-raw/jquery.cookie.js', 'js-raw/app.js']
				, dest: 'temp/app.concat.js'
			}
			, admin_main: {
				src: ['js-raw/admin.js']
				, dest: 'temp/admin.concat.js'
			}
		}

		, uglify: {
			dist: {
				files: {
					'public/js/admin.min.js': 'temp/admin.concat.js'
					, 'public/js/app.min.js': 'temp/app.concat.js'
				}
			}
		}
		
		// qunit: {
		// 	files: ['test/**/*.html']
		// }
		
		, jshint: {
			// all: ['asdf.js'],
			with_overrides: {
				files: {
					src: [
						'app.js'
						, 'js-raw/*.js'
						, '!js-raw/jquery.js'
						, '!js-raw/jquery-ui-1.10.3.custom.js'
						, 'lib/*.js'
						, 'models/*.js'
						, 'routes/*.js'
					]
					
				}
				, options: {
				// options here to override JSHint defaults
					laxcomma: true
				}
			}
		}

		, compass: {
			dist: {
				options: {
					sassDir: 'sass'
					, cssDir: 'public/css'
				}
			}
		}

		, watch: {
			styleCompile: {
				files: ['./sass/*.sass']
				, tasks: ['compass']
			}

			, scriptCheck: {
				files: [
					'app.js'
					, 'js-raw/*.js'
					, '!js-raw/jquery.js'
					, '!js-raw/jquery-ui-1.10.3.custom.js'
					, 'lib/*.js'
					, 'models/*.js'
					, 'routes/*.js'
				]
				, tasks: ['jshint']
			}

			, scriptCompile: {
				files: [
					'js-raw/app.js'
					, 'js-raw/admin.js'
				]
				, tasks: ['concat', 'uglify']
			}
			
		}

		, coffee: {
			glob_to_multiple: {
				expand: true,
				flatten: true,
				cwd: 'js-raw',
				src: ['*.coffee'],
				dest: 'public/js/',
				ext: '.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-coffee');

	grunt.registerTask('default'
		, ['jshint'
			// , 'qunit'
			, 'concat'
			, 'uglify'
			, 'compass'
			, 'coffee'
		]
	);

};