(function () {

    let app = angular
        .module('app', ['ionic', 'auth0.auth0', 'angular-jwt', '720kb.tooltips']);
    
        // .config(config);

    // config.$inject = ['$stateProvider', '$urlRouterProvider', 'angularAuth0Provider', '$httpProvider'];

    app.filter('capitalizeKeys', function() {
        return function(input) {
            return (!!input) ? input.split('_').map(w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()).join(' ') : '';
        }
    });


})();



