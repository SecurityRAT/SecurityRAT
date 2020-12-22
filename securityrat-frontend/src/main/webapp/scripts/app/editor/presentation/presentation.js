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
				onEnter: function ($state, $stateParams) {
					var presentationThemeCssElem = document.createElement('link');
					presentationThemeCssElem.id = 'theme';
					presentationThemeCssElem.rel = 'stylesheet';
					presentationThemeCssElem.type = 'text/css';
					var themeRegex = /[a-z\.]+\.css/i;
					if (!themeRegex.test($stateParams.theme)) {
						presentationThemeCssElem.href = '/bower_components/reveal.js/dist/theme/black.css';
					} else {
						presentationThemeCssElem.href = '/bower_components/reveal.js/dist/theme/' + $stateParams.theme;
					}

					var paperCssElem = document.createElement('link');
					paperCssElem.id = 'pdf';
					paperCssElem.rel = 'stylesheet';
					paperCssElem.type = 'text/x-scss';
					paperCssElem.href = 'bower_components/reveal.js/css/print/paper.scss';
					var revealCssElem = document.createElement('link');
					revealCssElem.id = 'reveal';
					revealCssElem.rel = 'stylesheet';
					revealCssElem.type = 'text/css';
					revealCssElem.href = 'bower_components/reveal.js/dist/reveal.css';
					document.getElementsByTagName('head')[0].appendChild(revealCssElem);
					document.getElementsByTagName('head')[0].appendChild(presentationThemeCssElem);
					document.getElementsByTagName('head')[0].appendChild(paperCssElem);

					var links = document.getElementsByTagName('link');
					for (var i = 0; i < links.length; i++) {
						if (links[i].href.indexOf('main.css') !== -1) {
							document.head.removeChild(links[i]);
						}
					}
					//        			var maincss = document.getElementById('maincss');
					//        			document.head.removeChild(links[i]);
				},
				onExit: function () {
					var maincss = document.createElement('link');
					maincss.id = 'theme';
					maincss.rel = 'stylesheet';
					maincss.type = 'text/css';
					maincss.href = '/assets/styles/main.css';
					document.getElementsByTagName('head')[0].appendChild(maincss);
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
