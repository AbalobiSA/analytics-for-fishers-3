(function () {
    'use strict';

    angular
        .module('app')
        .component('settingsAdmin', {
            templateUrl: 'components/settings/settings-admin.template.html',
            controller: settingsAdminController,
            bindings: {
                pwSubject: '<',
                errObs: '<'
            }
        });

    // settingsAdminController.$inject = ['$state', '$http', '$filter',  'Analytics',
    // '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function settingsAdminController(){
        let ctrl = this;
        ctrl.password = "";
        ctrl.enabled = false;
        ctrl.hasErr = false;

        ctrl.update = function(){
            ctrl.enabled = ctrl.password.length > 0;
        }

        ctrl.adminLogin = function() {
            ctrl.hasErr = false;
            ctrl.pwSubject.onNext(ctrl.password);
        }

        ctrl.errObs.subscribe(e => ctrl.hasErr = true);
    }
}());