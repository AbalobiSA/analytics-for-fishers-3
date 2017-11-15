(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['authService', 'stateService', 'Analytics'];

    function LoginController(authService, stateService, ganalytics) {
        let vm = this;

        vm.username = localStorage.getItem('lastUsername') || "";
        vm.password = "";
        vm.rememberMe = false;

        vm.login = login;
        vm.signup = signup;
        vm.noCredentials = noCredentials;

        vm.loginWithGoogle = authService.loginWithGoogle;

        // Log in with username and password
        function login() {
            ganalytics.trackEvent('login_page', 'attempt_login');
            authService.login(vm.username, vm.password);
        }

        function signup() {
            ganalytics.trackEvent('login_page', 'signup_clicked');
            authService.signup(vm.username, vm.password);
        }

        function noCredentials() {
            return !!(isNull(vm.username) || isNull(vm.password));
        }

        vm.getAuthId = function() {
            return AUTH0_CLIENT_ID;
        };

        vm.getAuthDomain = function() {
            return AUTH0_DOMAIN;
        };

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
