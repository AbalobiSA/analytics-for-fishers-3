(function () {

    let Auth0Cordova = require('@auth0/cordova');

    angular
        .module('app', ['ionic', 'auth0.auth0', 'angular-jwt'])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'angularAuth0Provider', '$httpProvider'];
})();



