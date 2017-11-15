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
        const baseTitle = 'Verslag - '
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

        ctrl.getTitle = function() {
            return 'Verslag'
        }

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

            sfdata.getNoTripReasonsList()
                .then(r => ctrl.noTripReasons = r)
                .catch(showError)
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
            console.log(JSON.stringify(response));
            responseData = response.data;

            ctrl.loading = false;

            let years = [];

            for (let year in responseData) {
                years.push(year);
            }

            ctrl.years = years;

            ctrl.sy = ctrl.years[ctrl.years.length-1];
            ctrl.sm = responseData[ctrl.sy].length-1;
            ctrl.sm = ctrl.sm.toString();

            ctrl.yearChange(ctrl.sy);

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
                default:
                    false;
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
            ctrl.title = 'Verslag -  '+ ctrl.months[ctrl.sm] + ' ' +ctrl.sy;
        };

        const yearSubject = new Rx.BehaviorSubject(ctrl.selectedyear);
        ctrl.yearChangeObs = yearSubject.asObservable();
        ctrl.yearChange = function(key) {
            let selectedMonth = responseData[key];

            let months = [];

            for (let i=0; i < selectedMonth.length; i++) {
                months.push(monthMap[selectedMonth[i].month]);
            }
    
            ctrl.months = months;
            let sm = parseInt(ctrl.sm)

            if (!(sm > 0)){
                ctrl.sm = "0"
            }else if (sm > ctrl.months.length){
                let max = ctrl.months.length-1;
                ctrl.sm = max.toString();
            }

            ctrl.monthChange(ctrl.sm, ctrl.sy);
        };

        const monthSubject = new Rx.BehaviorSubject(ctrl.selectedMonth);
        ctrl.monthObs = monthSubject.asObservable();
        ctrl.monthChange = function(index, year) {
            ctrl.selectedMonth = responseData[year][index];
            applyScope();
            setTitle()
            monthSubject.onNext(ctrl.selectedMonth);
        };
    }

}());
