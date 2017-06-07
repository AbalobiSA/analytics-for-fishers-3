(function () {

    angular
        .module('app', ['ionic', 'auth0.auth0', 'angular-jwt'])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'angularAuth0Provider'];

})();



