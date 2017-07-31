angular.module('sdlctoolApp')
    .factory('TrainingRoot', function ($resource) {
        return $resource('api/TrainingTreeNode/rootNode/:training_id', {}, {
            query: { method: 'GET', isArray: false}
        });
    })
    .factory('ChildrenOf', function ($resource) {
        return $resource('api/TrainingTreeNode/childrenOf/:id', {}, {
            query: { method: 'GET', isArray: true}
        });
    });
