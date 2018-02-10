(function () {

    'use strict';

    angular
        .module('app')
        .service('authService', authService);

    authService.$inject = ['$rootScope', '$state', 'angularAuth0',
        'authManager', 'jwtHelper', '$location', '$ionicPopup',
        'stateService', 'dataService', 'Analytics'];

    function authService($rootScope, $state, angularAuth0,
                         authManager, jwtHelper, $location, $ionicPopup,
                        stateService, dataService, ganalytics) {

        let userProfile = JSON.parse(localStorage.getItem('profile')) || {};

        function login(username, password) {

            stateService.setUsername(username);
            stateService.setPassword(password);

            localStorage.setItem('lastUsername', username);

            angularAuth0.login({
                connection: 'AbalobiUsers',
                responseType: 'token',
                popup: true,
                email: username,
                password: password
            }, onAuthenticated, null);
        }

        function signup(username, password) {
            angularAuth0.signup({
                connection: 'AbalobiUsers',
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
            dataService.clearAll();
            authManager.unauthenticate();
            userProfile = {};

            ganalytics.trackEvent('auth', 'logout');
            $state.go('menu.login');
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
                ganalytics.trackEvent('auth', 'login_failed');
                ganalytics.trackException(error.toString(), false);
                return $ionicPopup.alert({
                    title: 'Login failed!',
                    template: error
                });
            }

            localStorage.setItem('id_token', authResult.idToken);
            localStorage.setItem('access_token', authResult.accessToken);

            // stateService.setAccessToken();

            // console.log(JSON.stringify(authResult, null, 4));

            authManager.authenticate();

            angularAuth0.getProfile(authResult.idToken, function (error, profileData) {
                if (error) {
                    ganalytics.trackException(error.toString(), false);
                    ganalytics.trackEvent('auth', 'auth0_failure');
                    return console.log(error);
                }

                localStorage.setItem('profile', JSON.stringify(profileData));
                userProfile = profileData;

                ganalytics.trackEvent('auth', 'login_success');

                $location.path('/app/home');
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
                        // localStorage.removeItem('access_token');
                        dataService.clearAll();
                        authManager.authenticate();
                    }
                }
            }
        }

        function decodeTokenOrEmpty(token) {
            let pt = "";
            try{
                pt = jwtHelper.decodeToken(token);
            }catch(ex){}
            return pt;
        }

        function isAuthenticated() {
            checkAuthOnRefresh();
            let authed = $rootScope.isAuthenticated;
            let token  = localStorage.getItem('id_token');
            let pt = decodeTokenOrEmpty(token);
            let isValid = pt !== "";
            let isExpired = isTokenExpired(token);
            
            return authed && isValid && !isExpired;
        }

        function relogin(){
            let sc = localStorage.getItem("czsqwsx") || "";

            if (sc.length == 0) {
                return new Error("no credentials");
            }

            let u = "";
            let p = "";


            try{
                let dc = Base64.decode(Base64.decode(sc));
                let c = JSON.parse(dc);
                u = c.u || "";
                p = c.p || "";
            }catch(ex){
                return new Error("no credentials");
            }

            login(u, p);
        }

        return {
            login: login,
            logout: logout,
            signup: signup,
            loginWithGoogle: loginWithGoogle,
            checkAuthOnRefresh: checkAuthOnRefresh,
            authenticateAndGetProfile: authenticateAndGetProfile,
            isAuthenticated: isAuthenticated,
            relogin: relogin
        }
    }
})();
