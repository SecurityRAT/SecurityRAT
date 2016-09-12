'use strict';

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
                	theme: "securityrat.css"
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/editor/presentation/myRevealjs/presentation.html',
                        controller: 'PresentationController'
                    }
                },
                onEnter: function($state, $stateParams, $timeout){
                	var link = document.createElement( 'link' );
                	link.id = 'theme';
        			link.rel = 'stylesheet';
        			link.type = 'text/css';
        			link.href = 'scripts/app/editor/presentation/myRevealjs/revealjs/css/theme/' + $stateParams.theme;
        			var link2 = document.createElement( 'link' );
        			link2.id = 'reveal';
        			link2.rel = 'stylesheet';
        			link2.type = 'text/css';
        			link2.href = 'scripts/app/editor/presentation/myRevealjs/revealjs/css/reveal.css';
        			document.getElementsByTagName( 'head' )[0].appendChild( link2 );
        			document.getElementsByTagName( 'head' )[0].appendChild( link );
        			
        			
        			var maincss = document.getElementById('maincss');
        			document.head.removeChild(maincss);
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
        			document.head.removeChild(theme);
        			document.head.removeChild(reveal);
                },
                resolve: {
                    
                }
            });
    });
