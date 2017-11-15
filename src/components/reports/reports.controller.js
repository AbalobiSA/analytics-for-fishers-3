(function () {

    'use strict';

    angular
        .module('app')
        .controller('reportsController', reportsController);

    reportsController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService',
        'StringUtil', 'ResultsUtil', '$ionicPlatform'];

    function reportsController($state, $scope, $http,
         $rootScope, authService, stateService, dataService,
            StringUtil, ResultsUtil, $ionicPlatform) {

        let ctrl = this;
        const sfdata = dataService;
        let responseData;

        ctrl.seaDaysTabSelected = true;
        ctrl.incomeTabSelected = false;
        ctrl.expensesTabSelected = false;

        ctrl.loading = false;
        ctrl.months = [];
        ctrl.speciesList;

        ctrl.isNumber = (number) => typeof number === "number";

        ctrl.colors = [
            '#e0f3f8',
            '#fee090',
            '#74add1',
            '#313695',
            '#ffffbf',
            '#a50026',
            '#abd9e9',
            '#d73027',
            '#f46d43',
            '#4575b4',
            '#fdae61',
        ]
        const showError = function(err) {
            console.log(`Error: ${JSON.stringify(err, null, 4)}`);
            ctrl.loading = false;
            applyScope();
        };

        const monthMap = {
            1:'Januarie',
            2:'Februarie',
            3:'Maart',
            4:'April',
            5:'Mei',
            6:'Junie',
            7:'Julie',
            8:'Augustus',
            9:'September',
            10:'Oktober',
            11:'November',
            12:'Desember',
        }
        ctrl.monthMap = monthMap;

/*============================================================================
        Ionic Methods
 ============================================================================*/
        ctrl.$onInit = function() {
            resetLocalVariables();
            if (!ctrl.loading) {
                ctrl.seaDaysTabSelected = true;
                requestData();
            }
        }

/*============================================================================
         Data Methods
 ============================================================================*/
        function requestData(){
            console.log("DEBUG: Requesting data...");
            ctrl.loading = true;
            sfdata.queryReports(false)
                .then(handleResponse)
                .catch(showError);

            sfdata.getSpeciesList()
                .then(r => ctrl.speciesList = r)
                .catch(showError);
        }

        ctrl.requestFreshData = function () {
            ctrl.loading = true;
            sfdata.queryReports(true)
                .then(handleResponse)
                .catch(showError);
        };

        ctrl.requestData = requestData;

        const handleResponse = function(response){
            console.log("DEBUG: Response received. Logging info now...");
            console.log(response);
            responseData = response.data;

            ctrl.loading = false;

            let years = [];

            for (let year in responseData) {
                years.push(year);
            }

            ctrl.years = years;

            applyScope();
        };

// /*============================================================================
//      Utility Methods
//  ============================================================================*/
        ctrl.noDataExists = function() {
            return (isEmpty(responseData));
        };

        function resetLocalVariables() {
            console.log("Resetting local vars..");
            responseData = undefined;
            ctrl.sy = undefined;
            ctrl.sm = undefined;
        }

        function applyScope() {
            try {
                $scope.$apply();
            } catch (ex) {
                console.log("Scope apply already in progress!");
            }
        }

        function isEmpty(input) {
            return (input === undefined || input === null || input === "");
        }


        // ======== new methods

        ctrl.isTabSelected = function (idx) {
            switch (idx){
                case 0:
                    return ctrl.seaDaysTabSelected === true;
                case 1:
                    return ctrl.incomeTabSelected === true;
                case 2:
                    return ctrl.expensesTabSelected === true;
            }
        };

        ctrl.tabSelected = function (idx) {
            ctrl.seaDaysTabSelected = false;
            ctrl.incomeTabSelected = false;
            ctrl.expensesTabSelected = false;

            switch (idx){
                case 0:
                    ctrl.seaDaysTabSelected = true;
                    break;
                case 1:
                    ctrl.incomeTabSelected = true;
                    break;
                case 2:
                    ctrl.expensesTabSelected = true;
                    break;
            }
        };

        const setTitle = function() {
            ctrl.title = 'Verslag -  '+ ctrl.sm + ' ' +ctrl.years[0];
        };

        const yearSubject = new Rx.BehaviorSubject(ctrl.selectedyear);
        ctrl.yearChangeObs = yearSubject.asObservable();
        ctrl.yearChange = function(key) {
            console.log('year change', key);
            let selectedMonth = responseData[key];

            let months = [];

            for (let i=0; i < selectedMonth.length; i++) {
                console.log(selectedMonth[i]);
                months.push(monthMap[selectedMonth[i].month]);
            }
    
            ctrl.months = months;
        };

        const monthSubject = new Rx.BehaviorSubject(ctrl.selectedMonth);
        ctrl.monthObs = monthSubject.asObservable();
        ctrl.monthChange = function(index, year) {
            console.log('month change', index, year);

            ctrl.selectedMonth = responseData[year][index];
            monthSubject.onNext(ctrl.selectedMonth)
        };
    }

}());
