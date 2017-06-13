(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['authService', 'stateService'];

    function LoginController(authService, stateService) {
        var vm = this;

        vm.username = "";
        vm.password = "";

        vm.login = login;
        vm.signup = signup;
        vm.noCredentials = noCredentials;

        vm.loginWithGoogle = authService.loginWithGoogle;

        // Log in with username and password
        function login() {
            authService.login(vm.username, vm.password);
        }

        function signup() {
            authService.signup(vm.username, vm.password);
        }

        function noCredentials() {
            return !!(isNull(vm.username) || isNull(vm.password));
        }

        function isNull(input) {
            // console.log("Checking: " + input);
            // console.log("Value: " input);
            switch (input) {
                case "": return true;
                break;
                case null: return true;
                break;
                case undefined: return true;
                break;
                default: return false;
                break;
            }
        }

    }

})();