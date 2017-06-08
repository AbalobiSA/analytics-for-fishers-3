(function () {

    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService'];

    function HomeController($state, $scope, $http, $rootScope, authService, stateService, dataService) {

/*============================================================================
        Variable Declarations
 ============================================================================*/

        let vm = this;
        let consoletext = "";
        let recentCatches;

/*============================================================================
        Function Mappings
 ============================================================================*/

        vm.login = login;
        vm.getProfile = getProfile;
        vm.logout = authService.logout;
        vm.consoletext = getConsoleText;
        vm.getViewTitle = getViewTitle;
        vm.recentCatches = displayRecentCatches;

        vm.isLoading = false;

/*============================================================================
        View Enter
 ============================================================================*/
        $scope.$on('$ionicView.enter', function() {
            vm.isLoading = true;
            dataService.getRecentTrips((trips) => {
                recentCatches = processTrips(trips);
                vm.isLoading = false;
                // console.log(JSON.stringify(recentCatches));
            }, (error) => {
                recentCatches = undefined;
                console.log(error);
                vm.isLoading = false;
            })
        });
/*============================================================================
        Functions
 ============================================================================*/

        function getIdentityFromServer() {

        }

        function getViewTitle() {
            // if (isAuthenticated()) {
            //     return vm.getProfile().email;
            // } else {
            //     return "Fisher Analytics";
            // }
            return "Fisher Analytics";
        }

        function login() {
            $state.go("login");
        }

        function getProfile() {
            return JSON.parse(localStorage.getItem('profile'));
        }

        function getProfileString() {
            parseStorage(localStorage.getItem('profile'));
        }

        function parseStorage(input) {
            return JSON.stringify(JSON.parse(input), null, 4);
        }

        function getConsoleText() {
            return consoletext;
        }

        function displayRecentCatches() {
            return recentCatches;
        }

/*============================================================================
        Data Processing
 ============================================================================*/

        // TODO: Add Aggregate Code to combine catches on the same trip
        function processTrips(trips) {
            return trips;
        }

    }

}());
