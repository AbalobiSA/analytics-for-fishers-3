(function () {

    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$rootScope','authService'];

    function HomeController($state, $rootScope, authService) {
        var vm = this;

        vm.login = login;
        vm.getProfile = getProfile;
        vm.logout = authService.logout;

        function login() {
            $state.go("login");
        }

        function getProfile() {
            return parseStorage(localStorage.getItem('profile'));
        }

        function parseStorage(input) {
            return JSON.stringify(JSON.parse(input), null, 4);
        }
    }

}());
