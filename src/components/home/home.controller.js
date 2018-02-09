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
                console.log("home is authed");
                $state.go('menu.reports');
                ganalytics.trackEvent('home', 'redirect', 'reports')
            } else {
                vm.isLoading = true;
                console.log("home not authed");
                let err = authService.relogin();

                if (err){
                    vm.isLoading = false;
                    $scope.$apply();
                    vm.missingCreds = true;
                    return;
                }

                let count = 0
                let id = setInterval(() => {
                    count++;

                    if (authService.isAuthenticated()) {
                        console.log("authed removing loading");
                        vm.isLoading = false;
                        $scope.$apply();
                        clearInterval(id);
                    }

                    if (count > 3) {
                        console.log("failed removing loading");
                        vm.isLoading = false;
                        vm.hasError = true;
                        $scope.$apply();
                        clearInterval(id);
                    }
                }, 2000);
            }
        });
    }

}());
