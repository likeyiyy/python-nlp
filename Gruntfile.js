/* global module:false, __dirname */

var fs = require('fs');
var path = require('path');

module.exports = function (grunt) {
    'use strict';

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var EMPTY = 'empty:';

    var REQUIREJS_PATHS = {
        'ace': EMPTY,
        'x2js': EMPTY,
        'compose': EMPTY,
        "troopjs-core": EMPTY,
        "troopjs-utils": EMPTY,
        "troopjs-bundle": EMPTY,
        'troopjs-gllue': EMPTY,
        'jquery': EMPTY,
        'bootstrap': EMPTY,
        'typeahead': EMPTY,
        'jquery.ui': EMPTY,
        'bootstrap.datepicker': EMPTY,
        'jquery.cookie': EMPTY,
        'antiscroll': EMPTY,
        'jquery.actual': EMPTY,
        'noty': EMPTY,
        'jquery.tagit': EMPTY,
        'jquery.orgChart': EMPTY,
        'datatables': EMPTY,
        'jquery.datatables.ColReorder': EMPTY,
        'jquery.validate': EMPTY,
        'jquery.validate.extend': EMPTY,
        'calendar': EMPTY,
        'calendar.lang': EMPTY,
        'moment': EMPTY,
        'select2': EMPTY,
        'i18n': EMPTY,
        'bootstrap.editable': EMPTY,
        'autosize': EMPTY,
        'jquery.tree': EMPTY,
        'treetable': EMPTY,
        'highlight': EMPTY,
        'flot': EMPTY,
        'flot.resize': EMPTY,
        'flot.time': EMPTY,
        'flot.selection': EMPTY,
        'flot.pie': EMPTY,
        'flot.categories': EMPTY,
        'flot.orderbars': EMPTY,
        'plupload': EMPTY,
        'plupload.queue': EMPTY,
        'ckeditor': EMPTY,
        'raty': EMPTY,
        'qrcode': EMPTY,
        'test': EMPTY,
        'bootstrap.tour': EMPTY,
        'vis': EMPTY,
        'jquery.atwho': EMPTY,
        'jquery.caret': EMPTY,
        'jquery.tag-editor': EMPTY,
        'jsplumb': EMPTY,
        'prettycron': EMPTY,
        'fancybox': EMPTY,
        'fancybox-buttons': EMPTY,
        'echarts': EMPTY,
        'emojiarea': EMPTY,
        'jquery-mousewheel': EMPTY,
        'jquery.datetimepicker': EMPTY,
        'template': '../../framework/helper/template/template',
        'compile': '../../framework/helper/template/compile'
    };

    var jspath = path.resolve(__dirname + '/assets/src/js/');
    var jsdir = (function () {
        var jsdir = [];
        var dirs = fs.readdirSync(jspath);

        dirs.forEach(function (dir) {
            if (fs.statSync(__dirname + '/assets/src/js/' + dir).isDirectory()) {
                if (dir !== 'meta-templates') {
                    jsdir.push(dir);
                }
            }
        });

        return jsdir;
    }());

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        'replace': 'grunt-text-replace',
        'git-rev-parse': 'grunt-git-rev-parse'
    });

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'git-rev-parse': {
            "default": {
                "options": {
                    prop: "git.revision",
                    number: 10
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: ['Gruntfile.js', 'assets/src/js/**/*.js', 'assets/framework/**/*.js', 'assets_gllueme/src/js/**/*.js']
        },

        copy: {
            release: {
                files: [{
                    expand: true,
                    cwd: 'assets/src/js',
                    src: ['main.js', 'config.js'],
                    dest: 'assets/release/<%= git.revision %>/gllueweb'
                }]
            }
        },

        clean: {
            dist: ['assets/dist']
        },

        requirejs: '',

        uglify: {
            release: {
                files: [{
                    expand: true,
                    src: '*.js',
                    dest: 'assets/release/<%= git.revision %>/gllueweb',
                    cwd: 'assets/dist/gllueweb',
                    rename: function (dest, src) {
                        return dest + '/' + src.replace('.js', '.min.js');
                    }
                }]
            },
            options: {
                drop_debugger: true,
                compress: {
                    drop_debugger: true
                },
                beautify: {
                    screw_ie8: false,
                    beautify: true,
                    keep_quoted_props: true
                }
            }
        },

        less: {
            release: {
                options: {
                    paths: ['assets/src/css'],
                    compress: true,
                    yuicompress: true
                },
                files: {
                    'assets/release/<%= git.revision %>/gllueweb/main.css': 'assets/src/css/main.less'
                }
            }
        },
        csssplit: {
            dist: {
                src: ['assets/release/<%= git.revision %>/gllueweb/main.css'],
                dest: 'assets/release/<%= git.revision %>/gllueweb/style.css',
                options: {
                    suffix: '_'
                }
            }
        },

        replace: {
            afterFix: {
                src: ['assets/release/<%= git.revision %>/gllueweb/**.js'],
                overwrite: true,
                replacements: [{
                    from: 'define("template!',
                    to: 'define("framework/helper/template/template!'
                }, {
                    from: 'assets/framework/',
                    to: 'framework/'
                }]
            }
        }
    });



    grunt.registerTask('release', [
        'git-rev-parse:default',
        'jshint:all',
        'requireConfig',
        'requirejs',
        'uglify:release',
        'less:release',
        'csssplit',
        'copy:release',
        'replace:afterFix',
        'clean'
    ]);

    grunt.registerTask('requireConfig', function () {

        var requirejsTaks = [];
        var requirejsConfig = {};
        (function () {
            jsdir.forEach(function (item) {
                if (!/^\./.test(item)) {
                    var options = {
                        options: {
                            baseUrl: 'assets/src/js',
                            paths: REQUIREJS_PATHS,
                            packages: [{
                                name: 'framework',
                                location: EMPTY
                            }, {
                                name: 'custom-module',
                                location: EMPTY
                            }, {
                                name: 'custom-widget',
                                location: EMPTY
                            }],
                            out: 'assets/dist/gllueweb/' + item + '.js',
                            include: grunt.file.expand({
                                cwd: 'assets/src/js'
                            }, item + '/**/*.js').map(function (mapping) {
                                return mapping.replace(/\.js$/, '');
                            }),
                            exclude: ['config.js',
                                'main.js'
                            ],
                            optimize: "none"
                        }
                    };

                    if (item !== 'shared') {
                        options.options.exclude = options.options.exclude.concat(grunt.file.expand({
                            cwd: 'assets/src/js'
                        }, 'shared/**/*.js').map(function (mapping) {
                            return mapping.replace(/\.js$/, '');
                        }));
                    }

                    requirejsConfig[item] = options;
                    requirejsTaks.push(item);
                }
            });
        }());


        grunt.config('requirejs', requirejsConfig);
    });

    grunt.registerTask('default', 'Build framework', function() {
        grunt.log.writeln('Start building gllueweb');

        grunt.task.run(['release']);
    });
};
