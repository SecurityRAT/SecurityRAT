describe('angular-confirm', function() {

    var $rootScope, $uibModal;

    beforeEach(angular.mock.module('angular-confirm', function ($provide) {

        $provide.decorator('$uibModal', function($delegate) {
            $uibModal = {
                open: jasmine.createSpy('$uibModal.open', function(settings) {
                    return {result: settings};
                })
            };
            return $uibModal;
        });

        $provide.decorator('$confirm', function($delegate) {
            return jasmine.createSpy('$confirm', $delegate);
        });

    }));

    beforeEach(angular.mock.inject(function (_$rootScope_) {
        $rootScope = _$rootScope_;
    }));

    describe('ConfirmModalController', function() {
        var $scope, controller, data = {testVal: 1}, $uibModalInstance;

        beforeEach(angular.mock.inject(function($controller) {
            $scope = $rootScope.$new();
            $uibModalInstance = {
                close: jasmine.createSpy('$uibModalInstance.close'),
                dismiss: jasmine.createSpy('$uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('$uibModalInstance.result.then')
                }
            };
            controller = $controller('ConfirmModalController', {"$scope": $scope, "$uibModalInstance": $uibModalInstance, "data": data});
        }));

        it("should copy the data, not use it as a reference", function() {
            data.testVal = 2;
            expect($scope.data.testVal).toEqual(1);
        });

        it("should call close when $scope.ok is invoked", function() {
            $scope.ok();
            expect($uibModalInstance.close).toHaveBeenCalled();
        });

        it("should call dismiss when $scope.cancel is invoked", function() {
            $scope.cancel();
            expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

    });

    describe('$confirm factory', function() {

        var $confirm, $confirmModalDefaults;

        beforeEach(angular.mock.inject(function(_$confirm_, _$confirmModalDefaults_) {
            $confirm = _$confirm_;
            $confirm.and.callThrough();
            $confirmModalDefaults = _$confirmModalDefaults_;
            $uibModal.open.and.callThrough();
        }));

        it("should call $uibModal.open", function() {
            $confirm();
            expect($uibModal.open).toHaveBeenCalled();
        });

        it("should override the defaults with settings passed in", function() {
            var settings = $confirm({}, {"template": "hello"});
            expect(settings.template).toEqual("hello");
        });
		
		it("should not change the defaults", function() {
            var settings = $confirm({}, {"templateUrl": "hello"});
            expect(settings.templateUrl).toEqual("hello");
			expect(settings.template).not.toBeDefined();
			expect($confirmModalDefaults.template).toBeDefined();
			expect($confirmModalDefaults.templateUrl).not.toBeDefined();
        });

        it("should override the default labels with the data passed in", function() {
            var settings = $confirm({title: "Title"});
            var data = settings.resolve.data();
            expect(data.title).toEqual("Title");
            expect(data.ok).toEqual('OK');
        });

        it("should remove template if templateUrl is passed in", function() {
            var settings = $confirm({}, {templateUrl: "abc.txt"});
            expect(settings.template).not.toBeDefined();
        });

    });

    describe('confirm directive', function() {
        var $scope, element, $confirm, data;

        beforeEach(angular.mock.inject(function (_$confirm_, $compile) {
            $confirm = _$confirm_;

            $confirm.and.callFake(function(d) {
                data = d;
                return {then: function() {}}
            });

            $scope = $rootScope.$new();
            $scope.click = jasmine.createSpy('$scope.click');
        }));

        describe('resolve properties in title', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure, {{name}}?">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the name to the text property", function() {
                element.triggerHandler('click');
                expect(data.text).toEqual('Are you sure, Joe?');
            });
        });

        describe('without confirmIf', function() {

            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should call confirm on click and not call the function", function() {
                element.triggerHandler('click');
                expect($scope.click).not.toHaveBeenCalled();
                expect($confirm).toHaveBeenCalled();
            });

        });

        describe('with confirmIf option', function() {

            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-if="truthy">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should call confirm on click and not call the function", function() {
                $scope.truthy = true;
                $scope.$apply();
                element.triggerHandler('click');
                expect($scope.click).not.toHaveBeenCalled();
                expect($confirm).toHaveBeenCalled();
            });

            it("should call the function", function() {
                $scope.truthy = false;
                $scope.$apply();
                element.triggerHandler('click');
                expect($scope.click).toHaveBeenCalled();
                expect($confirm).not.toHaveBeenCalled();
            });

        });

        describe('with confirmTitle option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-title="Hello, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.title).toEqual('Hello, Joe!');
            });

        });

        describe('with confirmOk option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-ok="Okie Dokie, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.ok).toEqual('Okie Dokie, Joe!');
            });
        });

        describe('with confirmCancel option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-cancel="No Way, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.cancel).toEqual('No Way, Joe!');
            });
        });

        describe('with confirmSettings option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.settings = {name: 'Joe'};
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-settings="settings">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should pass the settings to $confirm", function() {
                element.triggerHandler('click');
                expect($confirm).toHaveBeenCalledWith({text: "Are you sure?"}, $scope.settings)
            });
        });

        describe('with confirmSettings option direct entry', function() {
            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm="Are you sure?" confirm-settings="{name: \'Joe\'}">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should pass the settings to $confirm", function() {
                element.triggerHandler('click');
                expect($confirm).toHaveBeenCalledWith({text: "Are you sure?"}, {name: "Joe"})
            });
        });

    });

});