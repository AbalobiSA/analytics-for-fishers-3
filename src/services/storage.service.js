/**
 * Created by Carl on 2017-06-06.
 */
(function () {

    'use strict';

    angular
        .module('app')
        .service('storageService', storageService);

    storageService.$inject = ['$rootScope', 'angularAuth0', 'authManager', 'jwtHelper', '$location', '$ionicPopup'];

    function storageService($rootScope, angularAuth0, authManager, jwtHelper, $location, $ionicPopup) {

        var userProfile = JSON.parse(localStorage.getItem('profile')) || {};

        function login(username, password) {
            angularAuth0.login({
                connection: 'Username-Password-Authentication',
                responseType: 'token',
                popup: true,
                email: username,
                password: password
            }, onAuthenticated, null);
        }

        function signup(username, password) {
            angularAuth0.signup({
                connection: 'Username-Password-Authentication',
                responseType: 'token',
                popup: true,
                email: username,
                password: password
            }, onAuthenticated, null);
        }

        function loginWithGoogle() {
            angularAuth0.login({
                connection: 'google-oauth2',
                responseType: 'token',
                popup: true
            }, onAuthenticated, null);
        }


        // Logging out just requires removing the user's
        // id_token and profile
        function logout() {
            localStorage.removeItem('id_token');
            localStorage.removeItem('profile');
            authManager.unauthenticate();
            userProfile = {};
        }

        function authenticateAndGetProfile() {
            var result = angularAuth0.parseHash(window.location.hash);

            if (result && result.idToken) {
                onAuthenticated(null, result);
            } else if (result && result.error) {
                onAuthenticated(result.error);
            }
        }

        function onAuthenticated(error, authResult) {
            if (error) {
                return $ionicPopup.alert({
                    title: 'Login failed!',
                    template: error
                });
            }

            localStorage.setItem('id_token', authResult.idToken);
            authManager.authenticate();

            angularAuth0.getProfile(authResult.idToken, function (error, profileData) {
                if (error) {
                    return console.log(error);
                }

                localStorage.setItem('profile', JSON.stringify(profileData));
                userProfile = profileData;

                $location.path('/');
            });
        }

        function isTokenExpired(token) {
            let exp = true;
            try{
                exp = jwtHelper.isTokenExpired(token);
            }catch(e){}
            return exp;
        }

        function checkAuthOnRefresh() {
            var token = localStorage.getItem('id_token');
            if (token) {
                if (!isTokenExpired(token)) {
                    if (!$rootScope.isAuthenticated) {
                        authManager.authenticate();
                    }
                }
            }
        }

        return {
            login: login,
            logout: logout,
            signup: signup,
            loginWithGoogle: loginWithGoogle,
            checkAuthOnRefresh: checkAuthOnRefresh,
            authenticateAndGetProfile: authenticateAndGetProfile
        }
    }
})();
