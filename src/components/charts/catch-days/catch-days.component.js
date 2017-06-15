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


        ctrl.$onInit = function() {
            // refreshBus.observable()
            //     .filter(evt => evt)
            //     .subscribe(evt => requestData());
            // refreshBus.post(null);
        };

        $scope.$on('$ionicView.enter', function() {
            if (!ctrl.loading) {
                ctrl.loading = true;
                requestData();
            }
        });

        function requestData() {
            ctrl.loading = true;
            sfdata.queryCatchDays(handlerResponse, showError, false);
        }

        const handlerResponse = function(result){
            console.log("##handling ##CD response");
            console.log(result);
            responseObs = result;
            // refreshBus.post(false);
            ctrl.loading = false;
            updateData()
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
        }
    }

}());
