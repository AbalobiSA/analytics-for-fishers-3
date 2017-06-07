/**
 * Created by Carl on 2017-06-06.
 */
(function () {

    'use strict';

    angular
        .module('app')
        .service('stateService', stateService);

    stateService.$inject = ['$rootScope', 'angularAuth0', 'authManager', 'jwtHelper', '$location', '$ionicPopup'];

    function stateService($rootScope, angularAuth0, authManager, jwtHelper, $location, $ionicPopup) {

        var userProfile = JSON.parse(localStorage.getItem('profile')) || {};



        return {

        }
    }
})();
