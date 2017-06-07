/**
 * Created by Carl on 2017-06-06.
 */
angular.module('app').config(function ($stateProvider, $urlRouterProvider, angularAuth0Provider) {
    $stateProvider
    // setup an abstract state for the tabs directive
        .state('home', {
            url: '/home',
            templateUrl: 'components/home/home.html'
        })

        .state('login', {
            url: '/',
            templateUrl: 'components/login/login.html'
        });

    $urlRouterProvider.otherwise('/');

    // Initialization for the angular-auth0 library
    angularAuth0Provider.init({
        clientID: AUTH0_CLIENT_ID,
        domain: AUTH0_DOMAIN
    });

});
