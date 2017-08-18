'use strict';

/* jshint undef: true */
/* globals document */

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('presentation', {
                parent: 'site',
                url: '/presentation?theme',
                data: {
                    roles: ['ROLE_FRONTEND_USER', 'ROLE_USER', 'ROLE_ADMIN'],
                    pageTitle: 'Presentation'
                },
                params: {
                	theme: 'securityrat.css'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/presentation/presentation.html',
                        controller: 'PresentationController'
                    }
                },
                onEnter: function($state, $stateParams){
                	var link = document.createElement( 'link' );
                	link.id = 'theme';
        			link.rel = 'stylesheet';
        			link.type = 'text/css';
        			link.href = 'bower_components/revealjs/css/theme/' + $stateParams.theme;
        			var link1 = document.createElement( 'link' );
        			link1.id = 'pdf';
        			link1.rel = 'stylesheet';
        			link1.type = 'text/css';
        			link1.href = 'bower_components/revealjs/css/print/paper.css';
        			var link2 = document.createElement( 'link' );
        			link2.id = 'reveal';
        			link2.rel = 'stylesheet';
        			link2.type = 'text/css';
        			link2.href = 'bower_components/revealjs/css/reveal.css';
        			document.getElementsByTagName( 'head' )[0].appendChild( link2 );
        			document.getElementsByTagName( 'head' )[0].appendChild( link );
        			document.getElementsByTagName( 'head' )[0].appendChild( link1 );
        			
        			var links = document.getElementsByTagName('link');
        			for(var i = 0; i < links.length; i++) {
        				if(links[i].href.indexOf('main.css') !== -1) {
        					document.head.removeChild(links[i]);
        				}
        			}
//        			var maincss = document.getElementById('maincss');
//        			document.head.removeChild(links[i]);
                },
                onExit: function() {
                	var maincss = document.createElement( 'link' );
                	maincss.id = 'theme';
                	maincss.rel = 'stylesheet';
                	maincss.type = 'text/css';
                	maincss.href = '/assets/styles/main.css';
        			document.getElementsByTagName( 'head' )[0].appendChild( maincss );
        			var theme = document.getElementById('theme');
        			var reveal = document.getElementById('reveal');
        			var pdf = document.getElementById('pdf');
        			document.head.removeChild(theme);
        			document.head.removeChild(reveal);
        			document.head.removeChild(pdf);
                },
                resolve: {
                    
                }
            });
    });
