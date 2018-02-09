(function () {

    'use strict';

    angular
        .module('app')
        .controller('reportsController', reportsController);

    reportsController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService',
        'StringUtil', 'ResultsUtil', '$ionicPlatform', 'Analytics', 'localDataService'];

    function reportsController($state, $scope, $http,
         $rootScope, authService, stateService, dataService,
            StringUtil, ResultsUtil, $ionicPlatform, ganalytics, lds) {

        let ctrl = this;
        const sfdata = dataService;
        const baseTitle = 'Verslag - '
        let responseData;

        ctrl.seaDaysTabSelected = false;
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
            ganalytics.trackEvent('reports', 'error', err.toString());
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
            if(!authService.isAuthenticated()) {
                $state.go('menu.home');
            }
            console.log("DEBUG: Requesting data...");
            ganalytics.trackEvent('reports', 'request_data', 'init');
            ctrl.loading = true;
            ctrl.tabSelected(0);
            sfdata.queryReports(false)
                .then(handleResponse)
                .catch(showError);

            ctrl.speciesList = lds.getSpeciesList();

            ctrl.noTripReasons = lds.getNoTripReasonsList();
        }

        ctrl.requestFreshData = function () {
            if(!authService.isAuthenticated()) {
                $state.go('menu.home');
            }
            ganalytics.trackEvent('reports', 'request_data', 'refresh');
            ctrl.loading = true;
            sfdata.queryReports(true)
                .then(handleResponse)
                .catch(showError);
        };

        ctrl.requestData = requestData;

        const handleResponse = function(response){
            console.log("DEBUG: Response received. Logging info now...");
            ganalytics.trackEvent('reports', 'request_data', 'response_received');
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
            ganalytics.trackEvent('reports', 'request_data', 'handled_response');
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
            ganalytics.trackEvent('reports', 'year_change', key);
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
            ganalytics.trackEvent('reports', 'month_change', year + '-' + ctrl.selectedMonth.month);
            applyScope();
            setTitle()
            monthSubject.onNext(ctrl.selectedMonth);
        };

        ctrl.getProfile = function getProfile() {
            return JSON.parse(localStorage.getItem('profile'));
        }
    }

}());
