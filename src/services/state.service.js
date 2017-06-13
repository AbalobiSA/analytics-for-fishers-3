/**
 * Created by Carl on 2017-06-06.
 */
(function () {

    'use strict';

    angular
        .module('app')
        .service('stateService', stateService);

    stateService.$inject = ['$rootScope', 'angularAuth0', 'authManager', 'jwtHelper', '$location', '$ionicPopup'];

    function stateService($rootScope, angularAuth0, authManager, jwtHelper, $location, $ionicPopup) {
        let globalUsername = "";
        let globalPassword = "";
        let globalAccessToken = "";

        function setUsername(input) {
            if ($rootScope.isAuthenticated) {
                globalUsername = input;
            }
        }

        function setPassword(input) {
            if ($rootScope.isAuthenticated) {
                globalPassword = input;
            }
        }

        function setAccessToken(input) {
            // if ($rootScope.isAuthenticated) {
            console.log("Setting token to: " + input);
                globalAccessToken = input;
            // }
        }

        function getAccessToken() {
            return globalAccessToken;
        }

        return {
            getUsername: globalUsername,
            getPassword: globalPassword,
            getAccessToken: getAccessToken,

            setUsername: setUsername,
            setPassword: setPassword,
            setAccessToken: setAccessToken
        }
    }
})();
