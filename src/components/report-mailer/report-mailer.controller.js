(function () {

    'use strict';

    angular
        .module('app')
        .controller('reportMailerController', reportMailerController);

    reportMailerController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function reportMailerController($state, $scope, $http,
        $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        let ctrl = this;
        ctrl.loading = false;
        ctrl.emailSending = false;
        let userId;
        let mainEmailAddress;

/*============================================================================
        View enter
 ============================================================================*/
        $scope.$on('$ionicView.enter', function() {

            resetLocalVariables();

            ctrl.requestStatus = 0;
            ctrl.loading = true;

            dataService.getEmailAddress((email, abalobi_id) => {

                if (emailIsInvalid(email)) {
                    mainEmailAddress = "";

                    // TODO: Show a toast notification that no email was found for this user

                } else {
                    mainEmailAddress = email;
                }

                userId = abalobi_id;
                ctrl.email = mainEmailAddress;
                ctrl.loading = false;
            }, (error) => {
                console.log("Unable to get email address. " + error);
                ctrl.loading = false;
            });
        });

        ctrl.send = function() {
            let endpoint = 'http://197.85.186.65:8080/pdf-report?ownerId='+userId+"&destEmail="+ctrl.email;
            console.log("sending -> "+endpoint);
            ctrl.emailSending = true;
            $http({method: 'GET', url: endpoint})
                .then(response => {
                    ctrl.requestStatus = 1;
                    ctrl.emailSending = false;
                })
                .catch(reason => {
                    ctrl.requestStatus = -1;
                    ctrl.emailSending = false;
                });
        };

        function resetLocalVariables() {
            userId = "";
            mainEmailAddress = "";
        }

        function emailIsInvalid(emailAddress) {
            let flag = false;

            let invalidStrings = [
                "@abalobi.login",
                "@a.b"
            ];

            for (let i of invalidStrings) {
                console.log(`checking ${i}`);
                if (emailAddress.indexOf(i) !== -1) {
                    // console.log("Found " + i);
                    flag = true;
                }
            }

            return flag;
        }
    }

}());
