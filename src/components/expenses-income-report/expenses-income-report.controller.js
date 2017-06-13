(function () {

    'use strict';

    angular
        .module('app')
        .controller('expensesIncomeReportController', expensesIncomeReportController);

    expensesIncomeReportController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function expensesIncomeReportController($state, $scope, $http,
                                         $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        const ctrl = this;
        const sfdata = dataService;
        let responseObs;

        ctrl.loading = false;
        ctrl.intervals = sfdata.TIME_INTERVALS.slice(1, 2);
        ctrl.selectedInterval = ctrl.intervals[0];
        ctrl.months = [];

        ctrl.selectedMonth;
        ctrl.expenses;
        ctrl.income;

        ctrl.isNumber = (number) => typeof number === "number";

        let selectedMonthSet = false;
        let expensesResponseDataObs;
        let incomeResponseDataObs;

        ctrl.isManager = false;
        ctrl.fisherList = sfdata.BASE_FISHER_LIST;
        ctrl.selectedFisher = null;

        $scope.$on('$ionicView.enter', function() {
            if (!ctrl.loading) {
                ctrl.loading = true;
                requestData();
            }
        });
        ctrl.loading = false;

        function requestData(){
            ctrl.loading = true;
            sfdata.queryExpensesIncomeByTimePeriod(ctrl.selectedInterval, handlerResponse, showError, false);
                // .then(handlerResponse, showError);
        }

        ctrl.requestData = requestData;

        const handleFisherListResponse = function (fList) {
            if(ctrl.isManager){
                fList.toArray()
                    .filter(fList => ctrl.selectedFisher === null)
                    .subscribe(fList => {
                        ctrl.fisherList = sfdata.BASE_FISHER_LIST.concat(fList);
                        ctrl.selectedFisher = ctrl.fisherList[0];
                        ctrl.fisherChange(ctrl.selectedFisher);
                    });
            }
        };

        const handlerResponse = function(result){
            console.log("handling e/i response");
            try{
                expensesResponseDataObs = result[0];
                incomeResponseDataObs = result[1];
                handleFisherListResponse(result[2]);
            } catch (ex) {
                console.log(ex);
                ctrl.loading = false;
            }

            // refreshBus.post(false);
            ctrl.loading = false;
            collectMonths(expensesResponseDataObs, incomeResponseDataObs);
        };

        ctrl.fisherChange = function (selection) {
            ctrl.selectedFisher = selection;
            requestData();
        };

        ctrl.intervalChange = function(selection) {
            requestData();
        };

        ctrl.monthChange = function(selection){
            updateData();
        };

        function collectMonths(expensesObs, incomeObs) {
            let expMonths = expensesObs.map(record => sfdata.groupByInterval(ctrl.selectedInterval, record));

            let incMonths = incomeObs.map(record => record.key);

            expMonths.concat(incMonths)
                .toArray()
                .map(months => new Set(months).values())
                .map(monthSetIterable => Array.from(monthSetIterable))
                .flatMap( arr => Rx.Observable.from(arr))
                .map( x => convertToDate(x))
                .toArray()
                .map(months => months.sort(ResultsUtil.dateComparator))
                .map(months => months.reverse())
                .map(months => months.map(convertToDateString))
                .subscribe(months => {
                    ctrl.months = months;
                    let index = ctrl.months.indexOf(ctrl.selectedMonth);
                    if(index < 0) { index = 0; }
                    ctrl.selectedMonth = ctrl.months[index];
                    ctrl.monthChange(ctrl.selectedMonth);
                });
        }

        function updateData(){
            let formattedExpense = expensesResponseDataObs
                .filter(record => sfdata.groupByInterval(ctrl.selectedInterval, record) === ctrl.selectedMonth.replace("-0", "-"))
                .doOnNext(record => {
                    record['total'] = Object.keys(record)
                        .filter(prop => prop.startsWith("cost_"))
                        .reduce((tot, prop) => tot + (record[prop] || 0), 0);
                })
                .defaultIfEmpty({total:"N/A"});

            let formattedIncome = incomeResponseDataObs
                .filter(record => record.key === ctrl.selectedMonth.replace("-0", "-"));

            Rx.Observable.concat(formattedExpense, formattedIncome)
                .toArray()
                .subscribe(data => {
                    ctrl.expenses = data[0];
                    ctrl.income = data[1];
                    $state.reload();
                });
        }

        const collectExpensesTotals = function(acc, entry){
            console.log("agg expenses => "+acc);
            console.log(entry);
            let total = Object.keys(entry)
                .filter(prop => prop.startsWith("cost_"))
                .reduce((tot, prop) => tot + (entry[prop] || 0), 0);
            return acc + total;
        };

        const collectIncomeTotals = function(acc, entry) {
            let priceProps = Object.keys(entry)
                .filter(prop => prop.startsWith("price_"));

            let batchPrice = priceProps
                .filter(prop => prop === "price_batch")
                .map(prop => entry[prop] || 0);

            let otherPrices = priceProps
                .filter(prop => prop !== "price_batch")
                .reduce((tot, prop) =>{
                    let propId = "sold_"+prop.split('_')[1]; //Gets the type (ie. crates, items, weight)
                    let value = (entry[prop] || 0)*(entry[propId] || 0);
                    return tot+value
                }, 0);
            return acc+batchPrice+otherPrices;
        };

        const convertToDate = function(dateString) {
            let yearMonth = dateString.split('-');
            let tempDate = new Date(yearMonth[0], yearMonth[1]-1, 1);
            return tempDate;
        };

        const convertToDateString = function(date) {
            let year = date.getFullYear();
            let month = date.getMonth()+1;
            if(month < 10){
                month = "0"+month;
            }
            return year+"-"+month;
        };

        function isEmpty(input) {
            return (input === undefined || input === null || input === "");
        }


        ctrl.noDataExists = function() {
            console.log(expensesResponseDataObs);
            return (isEmpty(expensesResponseDataObs) || isEmpty(incomeResponseDataOb));
        };


        const showError = function(err) {
            console.log(`Errpr: ${JSON.stringify(err, null, 4)}`);
            ctrl.loading = false;
            // refreshBus.post(false);
        }

    }

}());
