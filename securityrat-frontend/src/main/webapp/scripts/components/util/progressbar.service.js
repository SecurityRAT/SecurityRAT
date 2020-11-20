'use strict';

angular.module('sdlctoolApp')
    .service('ProgressBar', [ '$interval', '$timeout', function($interval, $timeout) {
        this.startProgressbar = function (progressbar) {
            
            progressbar.intervalPromise = $interval(function () {
                progressbar.barValue += 1;
            }, 150, 95);
            progressbar.hide = false;
            progressbar.showContent = false;
        };

        this.finishProgressbar = function (progressbar) {
            if (angular.isDefined(progressbar.intervalPromise)) {
                $interval.cancel(progressbar.intervalPromise);
                progressbar.intervalPromise = undefined;
            }
            progressbar.barValue = 100;
            $timeout(function () {
                progressbar.barValue = 0;
                progressbar.hide = true;
                progressbar.showContent = true;
            }, 2500);
        };
    }]);