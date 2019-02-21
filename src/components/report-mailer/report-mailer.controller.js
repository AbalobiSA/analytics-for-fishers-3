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
        ctrl.validEmail = false;
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
                dataService.getEmailAddress(true)
                    .then(processEmailSuccess)
                    .catch(processEmailError),

                dataService.getManagerUsers()
                    .then(managedUsersSuccess)
                    .catch(error => console.log("Get manager users error: ", error))
            ]).then(results => {
                console.log("All calls have been made with success.");
                ctrl.loading = false;
                $scope.$apply();
            }).catch(error => {
                console.log("Error running the promise all which fetches all data: ", error);
                ctrl.loading = false;
                $scope.$apply();
            })
        });

        ctrl.send = function() {

            let Id;

            if (ctrl.showManagerList === true) {
                Id = ctrl.selectedReportUser.abalobi_id__c
            } else {
                Id = ctrl.mainUserId
            }

            let endpoint = 'https://server.abalobi.org/pdf-report?ownerId='+ Id +"&destEmail="+ctrl.email;
            // let endpoint = 'http://localhost:8080/pdf-report?ownerId='+ Id +"&destEmail="+ctrl.email;
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
            let abalobi_id = result[1];

            console.log("RETURNED ID...: " + abalobi_id);
            console.log("Logging response");
            console.log("RETURNED FULL RESPONSE:", JSON.stringify(result, null, 4));

            if (emailIsInvalid(email)) {
                mainEmailAddress = "";
                ctrl.validEmail = false;
            } else {
                mainEmailAddress = email;
                ctrl.validEmail = true;
            }
            ctrl.mainUserId = abalobi_id;
            ctrl.email = mainEmailAddress;
        }

        function processEmailError(error) {
            console.log("Unable to get email address. " + error);
        }

        function managedUsersSuccess(response) {
            console.log("Returned managed users: ", JSON.stringify(response.data.results, null, 4));
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
