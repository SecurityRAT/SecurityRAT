angular.module('sdlctoolApp')
    .factory('TrainingTreeUtil', function ($resource) {
        return {
            RootNodeOfTraining: $resource('api/TrainingTreeNode/rootNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),
            ChildrenOfNode: $resource('api/TrainingTreeNode/childrenOf/:id', {}, {
                query: { method: 'GET', isArray: true}
            }),
            CustomSlideNode: $resource('api/TrainingCustomSlideNodeByTrainingTreeNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),
            BranchNode: $resource('api/TrainingBranchNodeByTrainingTreeNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            })
        };
    });
