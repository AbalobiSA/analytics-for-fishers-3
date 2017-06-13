(function () {

    'use strict';

    angular
        .module('app')
        .controller('reportMailerController', reportMailerController);

    reportMailerController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil', 'userservice'];

    function reportMailerController($state, $scope, $http,
        $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil, userservice) {

        let ctrl = this;
        let emailPromise = userservice.userEmail();
        let userIdPromise = userservice.userId();
        let userId;

        // ctrl.$onInit = function() {
        //
        // };

        $scope.$on('$ionicView.enter', function() {
            ctrl.requestStatus = 0;
            userIdPromise.then(result => userId = result);
            emailPromise.then(result => {
                console.log("email -> "+result);
                ctrl.email = result;

                $scope.$apply();
            });
        });

        ctrl.send = function() {
            let endpoint = 'http://'+userservice.pdfMailerUri+'/pdf-report?ownerId='+userId+"&destEmail="+ctrl.email;
            console.log("sending -> "+endpoint);
            $http({method: 'GET', url: endpoint})
                .then(response => ctrl.requestStatus = 1)
                .catch(reason => ctrl.requestStatus = -1);
        }
    }

}());
