'use strict';

angular.module('sdlctoolApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('training', {
                parent: 'entity',
                url: '/trainings',
                params: {
                    isDirty: false
                },
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN'],
                    pageTitle: 'Trainings'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/trainings.html',
                        controller: 'TrainingController'
                    }
                },
                resolve: {
                }
            })
            .state('training.detail', {
                parent: 'training',
                url: '/training/{id}',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN'],
                    pageTitle: 'Training'
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-detail.html',
                        controller: 'TrainingDetailController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return Training.get({id : $stateParams.id});
                    }]
                }
            })
            .state('training.generate', {
                parent: 'training',
                abstract: 'true',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-generate.html',
                        controller: 'TrainingGenerateController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return new Training();
                    }],
                    trainingRoot: ['TrainingTreeNode', function(TrainingTreeNode) {
                        return new TrainingTreeNode();
                    }]
                }
            })
            .state('training.new', {
                parent: 'training.generate',
                url: '/generate',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'skeleton@training.generate': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-skeleton.html',
                        controller: 'TrainingSkeletonController'
                    },
                    'requirements@training.generate': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-requirements.html',
                        controller: 'TrainingRequirementsController'
                    },
                    'optcolumns@training.generate': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-content.html',
                        controller: 'TrainingContentController'
                    },
                    'customize@training.generate': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-customize.html',
                        controller: 'TrainingCustomizeController'
                    }
                }
                // inherits resolve von parent
            })
            .state('training.edit', {
                parent: 'training',
                url: '/{id}',
                abstract: 'true',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-edit.html',
                        controller: 'TrainingEditController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return Training.get({id : $stateParams.id});
                    }]
                }
            })
            .state('training.edit.state', {
                parent: 'training.edit',
                url: '/edit',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'skeleton@training.edit': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-skeleton.html',
                        controller: 'TrainingSkeletonController'
                    }
                }
                // inherits resolve von parent
            })
            .state('training.editTree', {
                parent: 'training',
                url: '/tree/{id}',
                abstract: 'true',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-editTree.html',
                        controller: 'TrainingEditTreeController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return Training.get({id : $stateParams.id});
                    }]
                }
            })
            .state('training.editTree.state', {
                parent: 'training.editTree',
                url: '/edit',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'customize@training.editTree': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-customize.html',
                        controller: 'TrainingCustomizeController'
                    }
                }
                // inherits resolve von parent
            })
            .state('training.editSelection', {
                parent: 'training',
                url: '/selection/{id}',
                abstract: 'true',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-editSelection.html',
                        controller: 'TrainingEditSelectionController'
                    }
                },
                resolve: {
                    entity: ['$stateParams', 'Training', function ($stateParams, Training) {
                        return Training.get({id: $stateParams.id});
                    }]
                }
            })
            .state('training.editSelection.state', {
                parent: 'training.editSelection',
                url: '/edit',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'requirements@training.editSelection': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-requirements.html',
                        controller: 'TrainingRequirementsController'
                    },
                    'optcolumns@training.editSelection': {
                        templateUrl: 'scripts/app/entities/training/nested-views/training-content.html',
                        controller: 'TrainingContentController'
                    }
                }
                // inherits resolve von parent
            });
        $stateProvider
            .state('viewTraining', {
                parent: 'site',
                url: '/training/{id}/view',
                data: {
                    roles: ['ROLE_TRAINER', 'ROLE_ADMIN']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/entities/training/training-view.html',
                        controller: 'TrainingViewController'
                    }
                },
                onEnter: function($state, $stateParams, $timeout){
                    var link = document.createElement( 'link' );
                    link.id = 'theme';
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.href = 'bower_components/revealjs/css/theme/black.css';
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
                    entity: ['$stateParams', 'Training', function($stateParams, Training) {
                        return Training.get({id : $stateParams.id});
                    }]
                }
            });
    });
