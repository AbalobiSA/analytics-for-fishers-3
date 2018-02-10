(function () {

    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$scope', '$http', 'Analytics',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil'
    ];

    function HomeController($state, $scope, $http, ganalytics, $rootScope, authService, stateService, dataService, StringUtil) {

        /*============================================================================
                Variable Declarations
         ============================================================================*/

        let vm = this;

        /*============================================================================
                Function Mappings
         ============================================================================*/

        vm.isLoading = false;
        vm.hasError = false;
        vm.missingCreds = false;

        /*============================================================================
                View Enter
         ============================================================================*/
        $scope.$on('$ionicView.enter', function () {
            if (authService.isAuthenticated()) {
                vm.isLoading = false;
                $state.go('menu.reports');
                ganalytics.trackEvent('home', 'redirect', 'reports');
            } else {
                vm.isLoading = true;
                vm.isLoading = false;
                vm.hasError = false;
                let err = authService.relogin();

                if (err) {
                    vm.isLoading = false;
                    applyScope();
                    vm.missingCreds = true;
                    return;
                }

                let count = 0
                let id = setInterval(() => {
                    count++;

                    if (authService.isAuthenticated()) {
                        ganalytics.trackEvent('home', 'relogin', 'succes');
                        vm.isLoading = false;
                        applyScope();
                        clearInterval(id);
                        $state.go('menu.reports');
                    }

                    if (count > 3) {
                        ganalytics.trackException('unable to reauthenticate user', false);
                        ganalytics.trackEvent('home', 'relogin', 'fail');
                        vm.isLoading = false;
                        vm.hasError = true;
                        applyScope();
                        clearInterval(id);
                    }
                }, 2000);
            }
        });

        /*============================================================================
                Functions
         ============================================================================*/
        function applyScope() {
            try {
                $scope.$apply();
            } catch (ex) {
                console.log("Scope apply already in progress!");
            }
        }
    }

}());
