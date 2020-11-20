'use strict';

/* jshint undef: true */
/* globals  $, document, hljs, Reveal */

angular.module('sdlctoolApp')
	.controller('PresentationController', function ($scope, $rootScope, localStorageService, $filter, $timeout, $state) {
		$scope.values = localStorageService.get('myRevealjs');
//		console.log($scope.values);
		localStorageService.remove('myRevealjs');
		$scope.categories = [];
		$scope.regex = /^\s+$/g;
		function hasValue(id, arrayValue) {
			for(var i = 0; i < arrayValue.length; i++) {
				if(arrayValue[i].id === id) {
					return true;
				}
			}
			return false;
		}
		
		if($scope.values !== null) {
			angular.forEach($scope.values.requirements, function(requirement) {
				if(!hasValue(requirement.categoryId, $scope.categories)) {
					$scope.categories.push({
						name: requirement.category,
						id: requirement.categoryId,
						showOrder: requirement.categoryOrder
					});
				}
			});
			Reveal.initialize({
				loop: false,
				controls: true,
				progress: true,
				center: true,
				transition: $scope.values.config.transition,
				// More info https://github.com/hakimel/revealjs#dependencies
				dependencies: [
					{ src: 'bower_components/revealjs/lib/js/classList.js', condition: function() { return !document.body.classList; } },
					{ src: 'bower_components/revealjs/plugin/markdown/marked.js' },
					{ src: 'bower_components/revealjs/plugin/markdown/markdown.js' },
					{ src: 'bower_components/revealjs/plugin/notes/notes.js', async: true },
					{ src: 'bower_components/revealjs/plugin/zoom-js/zoom.js', async: true }
				]
			});
			$timeout(function() {
				$(document).ready(function() {
				  $('pre code').each(function(i, block) {
				    hljs.highlightBlock(block);
				  });
				});
			});
		} else {
			$state.go('editor');
		}
		
	});