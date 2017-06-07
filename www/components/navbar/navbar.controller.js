(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbarController', navbarController);

    navbarController.$inject = ['$rootScope','authService', 'stateService'];

    function navbarController($rootScope, authService, stateService) {

        var vm = this;

        // vm.login = login;
        // vm.signup = signup;
        vm.showBackButton = showBackButton;

        function showBackButton () {
            return false;
        }

        return {
            showBackButton: showBackButton
        };

    }



})();
