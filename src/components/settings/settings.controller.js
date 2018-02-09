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
                errSubject.onNext(true);
                return;
            }
            ctrl.authed = true;
        });
    }

}());
