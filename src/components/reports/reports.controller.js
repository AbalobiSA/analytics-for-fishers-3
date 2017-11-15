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

        let selectedMonthSet = false;
        let expensesResponseDataObs;
        let incomeResponseDataObs;

        // ctrl.expensesInfo = expensesResponseDataObs;
        // ctrl.incomeInfo = incomeResponseDataObs;
        // ctrl.rawData = rawResponseObs;

        ctrl.isManager = false;
        ctrl.fisherList = sfdata.BASE_FISHER_LIST;
        ctrl.selectedFisher = null;

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

        ctrl.errorToast = function (error) {
            // alert("Error!" , error);
        };

        const showError = function(err) {
            console.log(err);
            console.log(`Error: ${JSON.stringify(err, null, 4)}`);
            ctrl.loading = false;
            applyScope();
            // refreshBus.post(false);
        };

        ctrl.income = undefined;
        ctrl.expenses = undefined;

        // Pie chart config
        ctrl.chartConfig = {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: [
                        '#ff6384',
                        '#36a2eb',
                        '#cc65fe',
                        '#ffce56',
                        '#ff8f00',
                        '#dcd0d8'
                    ],
                    label: 'Incomes and Expenses'
                }]
            },
            options: {
                legend: {
                    // Disables the removal of data when legend items are clicked
                    onClick: function(event, legendItem) {}
                },
                responsive: true
            }
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


        // $scope.$on('$ionicView.enter', function() {
        //     console.log('on enter');
        //     resetLocalVariables();
        //     if (!ctrl.loading) {
        //         console.log('on enter refresh data');
        //         ctrl.loading = true;
        //         ctrl.seaDaysTabSelected = true;
        //         requestData();
        //     }
        // });

/*============================================================================
         Data Methods
 ============================================================================*/

//         ctrl.toggleChartView = function (val) {
//             this.showChart = val;
//
//             if (val === true) {
//                 let ctx = document.getElementById("chart-area").getContext("2d");
//                 ctrl.myPie = new Chart(ctx, ctrl.chartConfig);
//             } else {
//                 ctrl.myPie.destroy();
//             }
//         };
//
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
//
//         ctrl.calcluateExpenseKey = function(input) {
//             let month = input.month;
//             let year = input.year;
//
//             return `${year}-${month}`
//         };
//
//         const showError = function(err) {
//             console.log(`Error: ${JSON.stringify(err, null, 4)}`);
//             ctrl.loading = false;
//             applyScope();
//             // refreshBus.post(false);
//         };
//
//         function applyScope() {
//             try {
//                 $scope.$apply();
//             } catch (ex) {
//                 console.log("Scope apply already in progress!");
//             }
//         }
//
//         ctrl.printify = function(input) {
//             return JSON.stringify(input, null, 4)
//         };
//
//         ctrl.errorToast = function (error) {
//             // alert("Error!" , error);
//         };
//
//         ctrl.getExpenseData = function () {
//             return expensesResponseDataObs;
//         };
//
//         ctrl.getIncomedata = function () {
//             return incomeResponseDataObs;
//         };

        function resetLocalVariables() {
            console.log("Resetting local vars..");
            // expensesResponseDataObs = undefined;
            // incomeResponseDataObs = undefined;
            // rawResponseObs = undefined;
            // ctrl.isManager = false;
            // ctrl.selectedFisher = null;
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
            // console.log('is tab selected ', idx);
            // console.log('@@@', ctrl.seaDaysTabSelected, ctrl.incomeTabSelected, ctrl.expensesTabSelected);
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
            console.log('qweqweqweqweq');
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

        // ctrl.years = [2017];
        // ctrl.selectedYear = ['November', 'Oktober', 'September', 'Augustus', 'Julie', 'Junie', 'Mei', 'April', 'Maart', 'Februarie', 'Januarie'];
        // ctrl.sy = ctrl.selectedYear[0];
        // ctrl.selectedMonth = data.months[0];
        // setTitle();

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
            // let i = Math.max(ctrl.selectedYear.indexOf(index), 0);
            // console.log('year change', i);

            // ctrl.selectedyear = data.years[i];
            // ctrl.sm = ctrl.selectedYear[i];
            // setTitle();
            // yearSubject.onNext(ctrl.selectedyear)
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
