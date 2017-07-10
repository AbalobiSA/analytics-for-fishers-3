(function () {

    'use strict';

    angular
        .module('app')
        .controller('catchDaysController', catchDaysController);

    catchDaysController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function catchDaysController($state, $scope, $http,
                                      $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        const ctrl = this;
        const sfdata = dataService;
        let responseObs;

        ctrl.loading = false;
        ctrl.xTitle = "Month";
        ctrl.yTitle = "Days";
        ctrl.dataMap = undefined;


        ctrl.$onInit = function() {
            // refreshBus.observable()
            //     .filter(evt => evt)
            //     .subscribe(evt => requestData());
            // refreshBus.post(null);
        };

        $scope.$on('$ionicView.enter', function() {
            resetLocalVariables();
            ctrl.loading = true;
            requestData();
        });

        function requestData() {
            ctrl.loading = true;
            sfdata.queryCatchDays(handlerResponse, showError, false);
        }

        ctrl.requestFreshData = function() {
            ctrl.loading = true;
            sfdata.queryCatchDays(handlerResponse, showError, true);
        };

        const handlerResponse = function(result){
            console.log("Received response for fishing days! Handling now...");
            console.log("RESULT: " + result.toString());
            responseObs = result;
            // refreshBus.post(false);
            ctrl.loading = false;
            if (result !== undefined && result !== null) {
                updateData()
            }
        };

        const showError = function(err) {
            console.log("error");
            ctrl.loading = false;
            // refreshBus.post(false);
        };

        const updateData = function () {
            let interval = "monthly";
            let newResponseObs = Rx.Observable.of(responseObs);

            newResponseObs.flatMap(records => Rx.Observable.from(records))
                .map(rec => {return {
                    key: rec.date,
                    fishing: rec.fishing_days,
                    not_fishing: rec.non_fishing_days
                }})
                .toArray()
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = "Month";
                    ctrl.yTitle = "Days";
                    console.log("###catch days data");
                    console.log(data);
                });
        };

        function resetLocalVariables(){
            ctrl.dataMap = undefined;
            // responseObs = undefined;
        }

        ctrl.noDataExists = function() {
            // console.log(expensesResponseDataObs);
            return (isEmpty(ctrl.dataMap));
        };

        ctrl.printDebugData = function() {
            console.log("Response Object: " + responseObs + "\n" +
                "Data map: " + ctrl.dataMap);
        };

        function isEmpty(input) {
            return (input === undefined || input === null || input === "");
        }
    }

}());
