angular.module('sdlctoolApp')

    .controller('TrainingViewController', function ($scope, $rootScope, $stateParams, $state, $compile, $timeout,
                                                    apiFactory, entity, TrainingTreeNode, TrainingTreeUtil) {
        $scope.training = entity;
        $scope.slides = [];
        console.log("parameter for query: ", $scope.training.id);
        TrainingTreeUtil.RootNodeOfTraining.query({id: $scope.training.id}).$promise.then(function(foundRootNode){

            if(foundRootNode.id != null) {
                TrainingTreeNode.get({id: foundRootNode.id}).$promise.then(function (realRootNode) {

                    $scope.trainingRoot = realRootNode;

                    $scope.trainingRoot.loadSubTree(false).then(function () {
                        console.log("TREE LOADING FINISHED", $scope.trainingRoot);

                        $scope.trainingRoot.loadSlides().then(function (slides) {
                            slides.forEach(function (new_slide) {
                                $scope.slides.push(new_slide);
                            });

                            Reveal.initialize({
                                loop: false,
                                controls: true,
                                progress: true,
                                center: true,
                                transition: 'slide', // none/fade/slide/convex/concave/zoom

                                // More info https://github.com/hakimel/reveal.js#dependencies
                                dependencies: [
                                    {
                                        src: 'bower_components/revealjs/lib/js/classList.js', condition: function () {
                                            return !document.body.classList;
                                        }
                                    },
                                    {src: 'bower_components/revealjs/plugin/markdown/marked.js'},
                                    {src: 'bower_components/revealjs/plugin/markdown/markdown.js'},
                                    {src: 'bower_components/revealjs/plugin/notes/notes.js', async: true},
                                    {src: 'bower_components/revealjs/plugin/zoom-js/zoom.js', async: true}
                                ]
                            });
                            $timeout(function () {
                                $(document).ready(function () {
                                    $('pre code').each(function (i, block) {
                                        hljs.highlightBlock(block);
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                console.error("Could not find root node of training");
            }
        });
    });
