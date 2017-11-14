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

    app.filter('costKeysTranslator', function() {
        const costTypeMap = {
            'bait': 'ass',
            'fuel': 'brandstof',
            'food': 'voedsel',
            'harbour_fee': 'hawe_fooi',
            'oil' : 'olie',
            'other': 'ander',
            'transport': 'transport',
        }

        return function(input, a) {
            return costTypeMap[input] || input;
        }
    })


})();



