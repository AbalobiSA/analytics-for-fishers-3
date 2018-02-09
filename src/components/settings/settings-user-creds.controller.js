(function () {
    'use strict';

    angular
        .module('app')
        .component('settingsUserCreds', {
            templateUrl: 'components/settings/settings-user-creds.template.html',
            controller: settingsUserCredsController,
        });

    settingsUserCredsController.$inject = ['$state', 'Analytics', 'authService', '$rootScope'];

    function settingsUserCredsController($state, ganalytics, authService) {
        let ctrl = this;
        ctrl.username = localStorage.getItem('lastUsername') || "";
        ctrl.password = "";
        ctrl.enabled = false;

        ctrl.login = login;
        ctrl.noCredentials = noCredentials;

        ctrl.loginWithGoogle = authService.loginWithGoogle;

        // Log in with username and password
        function login() {
            let c = {
                u: ctrl.username,
                p: ctrl.password
            }
            let enc = Base64.encode(Base64.encode(JSON.stringify(c)));
            localStorage.setItem("czsqwsx", enc);
            authService.login(ctrl.username, ctrl.password);
        }

        function noCredentials() {
            ctrl.enabled = !(isNull(ctrl.username) || isNull(ctrl.password));
        }

        function getAuthId() {
            return AUTH0_CLIENT_ID;
        };

        function getAuthDomain () {
            return AUTH0_DOMAIN;
        };

        function isNull(input) {
            switch (input) {
                case "":
                    return true;
                    break;
                case null:
                    return true;
                    break;
                case undefined:
                    return true;
                    break;
                default:
                    return false;
                    break;
            }
        }
    }
}());
