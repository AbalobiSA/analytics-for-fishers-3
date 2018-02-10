(function () {

    'use strict';

    angular
        .module('app')
        .controller('settingsController', settingsController);

    settingsController.$inject = ['$state', '$scope', '$http',
        '$rootScope', 'authService', 'stateService', 'dataService',
        'StringUtil', 'ResultsUtil', '$ionicPlatform', 'Analytics', 'localDataService'
    ];

    function settingsController($state, $scope, $http,
        $rootScope, authService, stateService, dataService,
        StringUtil, ResultsUtil, $ionicPlatform, ganalytics, lds) {

        let ctrl = this;
        ctrl.authed = false;
        ctrl.pwSubject = new Rx.Subject();

        const errSubject = new Rx.Subject();
        ctrl.errObs = errSubject.asObservable();

        ctrl.pwSubject.subscribe(pw => {
            // NB this is currently not designed to be secure but provide a means for 
            // current users not to change the currently logged in user
            if (pw !== 'c'){
                ganalytics.trackEvent('settings', 'admin', 'incorrect-password');
                ganalytics.trackException('incorrect settings admin password entered', false);
                errSubject.onNext(true);
                return;
            }
            ganalytics.trackEvent('settings', 'admin', 'successful-login');
            ctrl.authed = true;
        });
    }

}());
