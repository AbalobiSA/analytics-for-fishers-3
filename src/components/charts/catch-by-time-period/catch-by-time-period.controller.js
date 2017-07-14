(function () {

    'use strict';

    angular
        .module('app')
        .controller('catchByTimePeriodController', catchByTimePeriodController);

    catchByTimePeriodController.$inject = ['$state', '$scope', '$http', '$window',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function catchByTimePeriodController($state, $scope, $http, $window,
         $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        const ctrl = this;
        const sfdata = dataService;
        let rawResponseObs;
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
            // Legacy code was removed.
        };

        ctrl.cWidth = Math.floor($window.innerWidth - 120) > 0 ? Math.floor($window.innerWidth - 120) : 10;
        // $window.addEventListener('resize', function(event){
        //     ctrl.cWidth = Math.floor($window.innerWidth - 120) > 0 ? Math.floor($window.innerWidth - 120) : 10;

            // Enable for realtime updating of graph width (Currently refreshing view but graph not updating)
            // $state.go($state.current, {}, {reload: true});
        // });

        ctrl.printThings = function () {
            console.log(JSON.stringify(responseObs, null, 4));
        };

        $scope.$on('$ionicView.enter', function() {
            resetLocalVariables();
            ctrl.loading = true;
            requestData();
        });

        function requestData(){
            ctrl.loading = true;
            console.log("Debug: Requesting data from server...");
            console.log("Selected interval: " + ctrl.selectedInterval);
            sfdata.queryCatchByTimePeriod(ctrl.selectedInterval, false)
                .then(handleResponse)
                .catch(showError);
        }

        ctrl.requestFreshData = function () {
            ctrl.loading = true;
            console.log("Debug: Requesting FRESH data from server...");

            sfdata.queryCatchByTimePeriod(ctrl.selectedInterval, true)
                .then(handleResponse)
                .catch(showError);
        };

        const handleFisherListResponse = function (fList) {
            fList.filter(fList => ctrl.selectedFisher === null)
                .subscribe(fList => {
                    ctrl.fisherList = fList;
                    // ctrl.selectedFisher = ctrl.fisherList[0];
                    // ctrl.fisherChange(ctrl.selectedFisher);
                });
        };

        const handleResponse = function(result){
            console.log("Debug: Logging actual data returned: \n");
            console.log(result);

            ctrl.isManager = result.data.is_manager;

            // Build a fisher list from the records
            let fishers = [];
            for (let record of result.data.records) {
                if (record.fisher_name && (fishers.indexOf(record.fisher_name) === -1)) {
                    fishers.push(record.fisher_name);
                }
            }
            fishers.push("All");
            fishers = fishers.sort();
            ctrl.fisherList = fishers;
            ctrl.selectedFisher = ctrl.fisherList[0];

            // if(ctrl.isManager){
            //     handleFisherListResponse(fishers);
            // }
            rawResponseObs = result.data.records;
            responseObs = Rx.Observable
                .from(result.data.records);

            // refreshBus.post(false);
            ctrl.loading = false;
            updateData();
        };

        ctrl.fisherChange = function (selection) {

            let currentResponseObs;

            if (ctrl.selectedFisher === "All") {
                currentResponseObs = rawResponseObs;
            } else {
                currentResponseObs = angular.copy(rawResponseObs.filter(item => {
                    return item.fisher_name === ctrl.selectedFisher;
                }));
            }

            responseObs = Rx.Observable
                .from(currentResponseObs);

            updateData();
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
                .groupBy(record => sfdata.groupByInterval(ctrl.selectedInterval.toLowerCase(), record))
                .flatMap(aggregateSpecies)
                .toArray()
                .map(data => data.sort((a, b) => ResultsUtil.sortByInterval(ctrl.selectedInterval, a, b)))
                .map(data => data.slice(getFirstPosition(data), data.length))
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = getXTitle(ctrl.selectedInterval);
                    ctrl.yTitle = getYTitle(ctrl.selectedCalculationMethod);
                    // $state.reload(); //Fixes reloading issues
                    $scope.$apply();
                });
        }

        /**
         * Determines what part of the data object to show.
         * Should always start at the current month - 12
         * @param data - Full array of data
         * @returns {number} - Start position
         */
        function getFirstPosition(data) {
            let lastPosition = data.length;
            if (data.length - 12 < 0) {
                return 0;
            } else {
                return (data.length - 12);
            }
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
            if (typeof acc.get(entry.species) === "number") {
                acc.set(entry.species, acc.get(entry.species) + entry[ctrl.selectedCalculationMethod.toLowerCase()] );
            } else {
                acc.set(entry.species, entry[ctrl.selectedCalculationMethod.toLowerCase()]);
            }

            return acc;
        }

        ctrl.printDebugData = function() {
            console.log("Response Object: " + responseObs + "\n" +
                "Data map: " + ctrl.dataMap);
        };

        function resetLocalVariables() {
            rawResponseObs = undefined;
            responseObs = undefined;
            ctrl.isManager = undefined;
        }

        function createRecord(key, totals){
            let rec = {key: key};
            totals.forEach((v, k) => rec[k] = v);
            return rec;
        }

        let showError = function(err) {
            ctrl.loading = false;
            $scope.$apply();
            // refreshBus.post(false);
        };

        ctrl.rawData = function () {
            return JSON.stringify(responseObs.toArray(), null, 4);
        };

        ctrl.rawDataMap = function() {
            return JSON.stringify(ctrl.dataMap.filter(item => {
                return (item.month === 1 && item.year === 2017)
            }), null, 4);
        }

    }

}());
