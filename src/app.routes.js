/**
 * Created by Carl on 2017-06-06.
 */
angular.module('app').config(function ($stateProvider, $urlRouterProvider, angularAuth0Provider) {
    $stateProvider
    // setup an abstract state for the tabs directive

        .state('menu', {
            url: "/app",
            controller: 'SidemenuCtrl',
            abstract: true,
            templateUrl: 'components/sidemenu/sidemenu.html'
        })

        .state('menu.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'components/home/home.html',
                    // conroller: 'HomeController'
                }
            }

        })

        .state('menu.login', {
            url: '/login',
            views: {
                'menuContent': {
                    templateUrl: 'components/login/login.html',
                    controller: 'LoginController'
                }
            }
        })

/*============================================================================
        Graphs
 ============================================================================*/

        .state('menu.catchtimeperiod', {
            url: "/catch-by-time-period",
            views: {
                'menuContent': {
                    templateUrl: "components/charts/catch-by-time-period/catch-by-time-period.template.html",
                    controller: 'catchByTimePeriodController'
                }
            }
        })

        .state('menu.expenseincomereport', {
            url: "/expenses-income-report",
            views: {
                'menuContent': {
                    templateUrl: "components/expenses-income-report/expenses-income-report.template.html"
                }
            }
        })

        .state('menu.reportmailer', {
            url: "/report-mailer",
            views: {
                'menuContent': {
                    templateUrl: "components/report-mailer/report-mailer.template.html"
                }
            }
        })

        .state('menu.evolutionofprices', {
            url: "/evolution-of-prices",
            views: {
                'menuContent': {
                    templateUrl: "components/charts/evolution-of-prices/evolution-of-prices.template.html"
                }
            }
        })


    $urlRouterProvider.otherwise('/app/home');

    // Initialization for the angular-auth0 library
    angularAuth0Provider.init({
        clientID: AUTH0_CLIENT_ID,
        domain: AUTH0_DOMAIN
    });

});
