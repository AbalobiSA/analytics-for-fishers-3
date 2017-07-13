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
        ctrl.showManagerList = false;
        let userId;
        let mainEmailAddress;

        let managedUsers;
        // let selectedReportUser;
        // ctrl.mainUserId

/*============================================================================
        View enter
 ============================================================================*/
        $scope.$on('$ionicView.enter', function() {
            resetLocalVariables();

            ctrl.requestStatus = 0;
            ctrl.loading = true;

            Promise.all([
                dataService.getEmailAddress(false)
                    .then(processEmailSuccess)
                    .catch(processEmailError),

                dataService.getManagerUsers()
                    .then(managedUsersSuccess)
                    .catch(error => console.log(error))
            ]).then(results => {
                // console.log("All calls have been made.");
                ctrl.loading = false;
                $scope.$apply();
            }).catch(error => {
                console.log("Promise all error: " + error);
                ctrl.loading = false;
                $scope.$apply();
            })
        });

        ctrl.send = function() {

            let Id;

            if (ctrl.showManagerList === true) {
                Id = ctrl.selectedReportUser.Id
            } else {
                Id = ctrl.mainUserId
            }

            let endpoint = 'http://197.85.186.65:8080/pdf-report?ownerId='+ Id +"&destEmail="+ctrl.email;
            console.log("sending -> "+endpoint);
            ctrl.emailSending = true;

            let options = {method: 'GET', url: endpoint};

            $http(options)
                .then(response => {
                    ctrl.requestStatus = 1;
                    ctrl.emailSending = false;
                })
                .catch(reason => {
                    ctrl.requestStatus = -1;
                    ctrl.emailSending = false;
                });
        };

        /**
         * If an email is returned, check if it is valid, and then set the
         * current local email variable in the controller.
         * @param result
         */
        function processEmailSuccess(result) {
            let email = result[0];
            let Id = result[1];
            console.log("RETURNED ID: " + Id);
            if (emailIsInvalid(email)) {
                mainEmailAddress = "";
            } else {
                mainEmailAddress = email;
            }
            ctrl.mainUserId = Id;
            ctrl.email = mainEmailAddress;
        }

        function processEmailError(error) {
            console.log("Unable to get email address. " + error);
        }

        function managedUsersSuccess(response) {
            ctrl.managedUsers = response.data.results;
            ctrl.showManagerList = true;
        }

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
