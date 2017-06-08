/**
 * Created by Carl on 2017-06-06.
 */
(function () {

    'use strict';

    angular
        .module('app')
        .service('dataService', dataService);

    dataService.$inject = ['$rootScope', '$http', 'angularAuth0',
        'authManager', 'jwtHelper', '$location', '$ionicPopup', 'stateService'];

    function dataService($rootScope, $http, angularAuth0,
                         authManager, jwtHelper, $location, $ionicPopup, stateService) {

/*============================================================================
        Variable declarations
 ============================================================================*/

        let SERVER_IP = "http://localhost:8080";
        let endpoint = "/api/analytics/test";

        let recentCatches;

/*============================================================================
        Data Functions
 ============================================================================*/

        /**
         * Get the catches from the last 10 trips.
         * @param successCB
         * @param errorCB
         * @param refreshData {boolean} Should we refresh the data?
         */
        function getRecentCatches(successCB, errorCB, refreshData) {
            let access_token = localStorage.getItem('access_token');
            console.log("Debug: TOKEN: " + access_token);

            if (refreshData || recentCatches === undefined) {
                $http({
                    method: 'GET',
                    url: SERVER_IP + endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'access_token' : access_token
                    }
                }).then((response) => {
                    recentCatches = response.data.records;
                    successCB(recentCatches);
                }, (error) => {
                    errorCB(error);
                });
            }
            else {
                successCB(recentCatches);
            }
        }

        function clearAll () {
            recentCatches = undefined;
        }

        return {
            getRecentCatches: getRecentCatches,
            clearAll: clearAll
        }
    }
})();
