/**
 * Created by Carl on 2017-06-06.
 */
angular.module('app').config(function ($stateProvider, $urlRouterProvider, angularAuth0Provider, $httpProvider) {

    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.headers.get = {};
    $httpProvider.defaults.headers.get["Content-Type"] = "text/json";

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
                    templateUrl: "components/reports/reports.template.html"
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

        .state('menu.reports', {
            url: "/reports",
            views: {
                'menuContent': {
                    templateUrl: "components/reports/reports.template.html",
                }
            }
        })

        .state('menu.catchdaysreport', {
            url: "/catch-days-report",
            views: {
                'menuContent': {
                    templateUrl: "components/charts/catch-days/catch-days.template.html"
                }
            }
        })

        .state('menu.settings', {
            url: "/settings",
            views: {
                "menuContent": {
                    templateUrl: "components/settings/settings.template.html"
                }
            }
        });


    $urlRouterProvider.otherwise('/app/home');

    // Initialization for the angular-auth0 library
    angularAuth0Provider.init({
        clientID: AUTH0_CLIENT_ID,
        domain: AUTH0_DOMAIN
    });

});
