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
            }),
            RequirementNode: $resource('api/TrainingRequirementNodeByTrainingTreeNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),
            GeneratedSlideNode: $resource('api/TrainingGeneratedSlideNodeByTrainingTreeNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),
            CategoryNode: $resource('api/TrainingCategoryNodeByTrainingTreeNode/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),

            OptColumnContent: $resource('api/optColumnContents/byOptColumnAndRequirement/:optColumnId' +
                '/:requirementId', {}, {
                query: { method: 'GET', isArray: false}
            }),

            TreeWithPreparedContent:  $resource('api/trainingTreeNodesWithPreparedContent/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),

            CheckUpdate: $resource('api/trainingTreeNodeUpdate/:id', {}, {
                query: { method: 'GET', isArray: false}
            }),
            ExecuteUpdate: $resource('api/trainingTreeNodeUpdate/', {}, {
                query: { method: 'POST', isArray: false}
            })


        };
    });
