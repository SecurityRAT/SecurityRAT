angular.module('sdlctoolApp')

    .controller('TrainingViewController', function ($scope, $rootScope, $stateParams, $state, $compile, $timeout,
                                                    apiFactory, entity, TrainingTreeNode, TrainingRoot) {
        $scope.training = entity;
        $scope.slides = [];
        console.log("parameter for query: ", $scope.training.id);
        TrainingRoot.query({training_id: $scope.training.id}).$promise.then(function(foundRootNode){
            console.log("The foundRootNode", foundRootNode);
            TrainingTreeNode.get({id: foundRootNode.id}).$promise.then(function(realRootNode) {

                $scope.trainingRoot = realRootNode;

                $scope.trainingRoot.loadSubTree().then(function() {
                    console.log("TREE LOADING FINISHED", $scope.trainingRoot);

                    $scope.trainingRoot.loadSlides().forEach(function(new_slide) {
                        $scope.slides.push(new_slide);
                    });
                    console.log("Slides loaded:", $scope.slides);

                    Reveal.initialize({
                        loop: false,
                        controls: true,
                        progress: true,
                        center: true,
                        transition: 'none', // none/fade/slide/convex/concave/zoom

                        // More info https://github.com/hakimel/reveal.js#dependencies
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
                });
            });
        });
    });
