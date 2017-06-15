(function () {

    'use strict';

    angular
        .module('app')
        .controller('priceEvolutionController', priceEvolutionController);

    priceEvolutionController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function priceEvolutionController($state, $scope, $http,
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

        ctrl.methods = ["Batch"].concat(sfdata.QUANTITY_AGGREGATION_TYPES);
        ctrl.selectedCalculationMethod = ctrl.methods[0];
        ctrl.isCoop = false;
        ctrl.loading = false;
        ctrl.isManager = false;
        ctrl.fisherList = sfdata.BASE_FISHER_LIST;
        ctrl.selectedFisher = null;
        ctrl.data = [];
        ctrl.xTitle = "Month";
        ctrl.yTitle = "TODO change this";

        ctrl.$onInit = function() {

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
            //TODO add necessary methods
            sfdata.queryEvolutionOfPrices(ctrl.selectedCalculationMethod, handlerResponse, showError, false);
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
            console.log("handling response");
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

        ctrl.calculationToggleChange = function(selection){
            ctrl.isCoop = selection;
            updateData();
        };

        ctrl.calculationMethodChange = function(selection){
            updateData();
        };

        function updateData(){
            let method = ctrl.selectedCalculationMethod;
            let personalOrCooop = ctrl.isCoop;
            responseObs
                .filter(rec => filterByCalcMethod(method, personalOrCooop, rec))
                .map(rec => { return {"date": new Date(rec.year, rec.month, 1), "species": rec.Name, "value":getEvoVal(method, personalOrCooop, rec)}})
                .groupBy(record => record.species)
                .flatMap(o => o.toArray())
                .map( list => list.sort((a, b) => ResultsUtil.dateComparator(a, b, "date")))
                .toArray()
                .subscribe(rec => {
                    ctrl.data = rec;
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

        let showError = function(err) {
            ctrl.loading = false;
            // refreshBus.post(false);
        };

        const convertPriceCalcMethodToVar = function (method, personalOrCooop){
            let prefix = "price_";
            if(personalOrCooop){
                prefix = "coop_price_";
            }
            let filterMethod = "";
            switch(method.toLowerCase()){
                case 'batch':
                    filterMethod = "batch";
                    break;
                case 'items':
                    filterMethod = "item";
                    break;
                case 'weight':
                    filterMethod = "kg";
                    break;
                case 'crates':
                    filterMethod = "crate";
                    break;
                default:
                    filterMethod = "batch";
            }

            return prefix+filterMethod;
        };

        const filterByCalcMethod = function (method, personalOrCooop, record) {
            let filterMethod = convertPriceCalcMethodToVar(method, personalOrCooop);
            return (record[filterMethod])? true : false
        };

        const getEvoVal = function (method, personalOrCooop, record) {
            let filterMethod = convertPriceCalcMethodToVar(method, personalOrCooop);
            return record[filterMethod];
        }

    }

}());
