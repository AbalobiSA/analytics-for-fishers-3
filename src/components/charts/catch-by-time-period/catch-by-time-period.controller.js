(function () {

    'use strict';

    angular
        .module('app')
        .controller('catchByTimePeriodController', catchByTimePeriodController);

    catchByTimePeriodController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function catchByTimePeriodController($state, $scope, $http,
         $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        const ctrl = this;
        const sfdata = dataService;
        let responseObs;

        ctrl.intervals = sfdata.TIME_INTERVALS;
        ctrl.methods = sfdata.QUANTITY_AGGREGATION_TYPES;
        ctrl.selectedCalculationMethod = ctrl.methods[0];
        ctrl.selectedInterval = ctrl.intervals[1];


        ctrl.loading = false;
        ctrl.isManager = false;
        ctrl.fisherList = sfdata.BASE_FISHER_LIST;
        ctrl.selectedFisher = null;

        ctrl.$onInit = function() {
            // refreshBus.observable()
            //     .filter(evt => evt)
            //     .subscribe(evt => requestData());
            // refreshBus.post(null);
            // userservice.userType()
            //     .then(result => ctrl.isManager = result === "fisher_manager");
            // requestData();
        };

        $scope.$on('$ionicView.enter', function() {
            if (!ctrl.loading) {
                ctrl.loading = true;
                requestData();
            }

            // ;
            // dataService.getRecentCatches((catches) => {
            //     aggregateCatchesByDate(catches);
            //     ctrl.loading = false;
            //     // console.log(JSON.stringify(recentCatches));
            // }, (error) => {
            //     recentCatches = undefined;
            //     console.log(error);
            //     ctrl.loading = false;
            // })
        });

        function requestData(){
            console.log("Debug: Requesting data from server...");
            sfdata.queryCatchByTimePeriod(ctrl.selectedInterval, handlerResponse, showError, false);
        }

        const handleFisherListResponse = function (fList) {
            fList.toArray()
                .filter(fList => ctrl.selectedFisher === null)
                .subscribe(fList => {
                    ctrl.fisherList = sfdata.BASE_FISHER_LIST.concat(fList);
                    ctrl.selectedFisher = ctrl.fisherList[0];
                    ctrl.fisherChange(ctrl.selectedFisher);
                });
        };

        const handlerResponse = function(result){
            console.log("Debug: Logging response");
            console.log(result);
            responseObs = result;

            // if(ctrl.isManager){
            //     handleFisherListResponse(result[1]);
            // }

            // refreshBus.post(false);
            ctrl.loading = false;
            updateData();
        };

        ctrl.fisherChange = function (selection) {
            requestData();
        };

        ctrl.intervalChange = function(selection) {
            requestData();
        };

        ctrl.calculationMethodChange = function(selection){
            updateData();
        };

        function updateData(){
            console.log("Debug: Updating data. Logging response object.");
            console.log(responseObs);
            // console.log(JSON.stringify(responseObs, null, 4));

            responseObs
                .groupBy(record => sfdata.groupByInterval(ctrl.selectedInterval, record))
                .flatMap(aggregateSpecies)
                .toArray()
                .map(data => data.sort((a, b) => ResultsUtil.sortByInterval(ctrl.selectedInterval, a, b)))
                .map(data => data.slice(0, 12))
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = getXTitle(ctrl.selectedInterval);
                    ctrl.yTitle = getYTitle(ctrl.selectedCalculationMethod);
                    // $state.reload(); //Fixes reloading issues
                });
        }

        function getYTitle(method) {
            switch(method.toLowerCase()){
                case 'items':
                    return "Quantity";
                case 'weight':
                    return "Weight (kg)";
                case 'crates':
                    return "Quantity (crates)";
                default: break;
            }
        }

        function getXTitle(method) {
            switch(method.toLowerCase()){
                case 'yearly':
                    return "Year";
                case 'monthly':
                    return "Month";
                case 'weekly':
                    return "Week";
                default: break;
            }
        }

        function aggregateSpecies(monthObs) {
            let records = new Map();

            return monthObs
                .reduce(collectTotal, records)
                .map(summedRecords => {
                    return createRecord(monthObs.key, summedRecords);
                });
        }

        function collectTotal(acc, entry){
            acc.set(entry.species, entry[ctrl.selectedCalculationMethod.toLowerCase()]);
            return acc;
        }

        function createRecord(key, totals){
            let rec = {key: key};
            totals.forEach((v, k) => rec[k] = v);
            return rec;
        }

        let showError = function(err) {
            ctrl.loading = false;
            // refreshBus.post(false);
        }

    }

}());
