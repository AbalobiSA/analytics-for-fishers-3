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
        let responseObs, rawResponseObs;
        ctrl.showChart = false;

        ctrl.loading = false;
        ctrl.intervals = sfdata.TIME_INTERVALS.slice(1, 2);
        ctrl.selectedInterval = ctrl.intervals[0];
        ctrl.months = [];

        ctrl.isNumber = (number) => typeof number === "number";

        let selectedMonthSet = false;
        let expensesResponseDataObs;
        let incomeResponseDataObs;

        // ctrl.expensesInfo = expensesResponseDataObs;
        // ctrl.incomeInfo = incomeResponseDataObs;
        ctrl.rawData = rawResponseObs;

        ctrl.isManager = false;
        ctrl.fisherList = sfdata.BASE_FISHER_LIST;
        ctrl.selectedFisher = null;

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

        let ctx = document.getElementById("chart-area").getContext("2d");
        window.myPie = new Chart(ctx, ctrl.chartConfig);

        $scope.$on('$ionicView.enter', function() {
            resetLocalVariables();
            if (!ctrl.loading) {
                ctrl.loading = true;
                requestData();
            }
        });

        ctrl.toggleChartView = function (val) {
            this.showChart = val;
        };

        function requestData(){
            ctrl.loading = true;
            sfdata.queryExpensesIncomeByTimePeriod(ctrl.selectedInterval, false)
                .then(handleResponse)
                .catch(showError);
        }

        ctrl.requestFreshData = function () {
            ctrl.loading = true;
            sfdata.queryExpensesIncomeByTimePeriod(ctrl.selectedInterval, true)
                .then(handleResponse)
                .catch(showError);
        };

        ctrl.requestData = requestData;

        const buildChartConfig = function (expense, income) {
            let labels = [];
            let datasets = [];

            // Expenses
            let costs = Object.keys(expense).filter(prop => prop.startsWith("cost_"));
            for (let i = 0; i < costs.length; i = i + 1) {
                if (expense[costs[i]] > 0) {
                    // Prettify label text
                    let parts = costs[i].split('_');
                    parts = parts.slice(1);
                    parts = parts.map(part => [String(part).substring(0, 1).toUpperCase(), String(part).substring(1)].join(''));

                    labels.push(parts.join(' '));
                    datasets.push(expense[costs[i]]);
                }
            }

            ctrl.chartConfig.data.labels = labels;
            ctrl.chartConfig.data.datasets[0].data = datasets;
        };

        const handleFisherListResponse = function (fList) {
            if(ctrl.isManager){
                fList.filter(fList => ctrl.selectedFisher === null)
                    .subscribe(fList => {
                        ctrl.fisherList = sfdata.BASE_FISHER_LIST.concat(fList);
                        ctrl.selectedFisher = ctrl.fisherList[0];
                        ctrl.fisherChange(ctrl.selectedFisher);
                    });
            }
        };

        const handleResponse = function(response){
            let currentResults = response.data.results;
            rawResponseObs = response.data.results;
            ctrl.isManager = response.data.is_manager;

            if (currentResults !== undefined) {
                console.log("handling e/i response");
                try{
                    // Debug output
                    console.log(currentResults[0]);
                    console.log(currentResults[1]);
                    console.log(currentResults[2]);

                    // Populate the fisher list
                    let fishers = [];
                    for (let record of currentResults[2]){
                        if (record.lkup_main_fisher_id__r.Name && (fishers.indexOf(record.lkup_main_fisher_id__r.Name) === -1)) {
                            fishers.push(record.lkup_main_fisher_id__r.Name);
                        }
                    }

                    // Add the All option to the list
                    // fishers.push("All");
                    fishers = fishers.sort();
                    ctrl.fisherList = fishers;

                    // Default selection to All
                    ctrl.selectedFisher = ctrl.fisherList[0];

                    // Map the data from the results
                    expensesResponseDataObs = Rx.Observable
                        .from(currentResults[0]);
                    incomeResponseDataObs = Rx.Observable
                        .from(currentResults[1]);
                } catch (ex) {
                    console.log(ex);
                    ctrl.loading = false;
                }

                // Filter the available months in the list
                collectMonths(expensesResponseDataObs, incomeResponseDataObs);

                ctrl.fisherChange(ctrl.selectedFisher);
            } else {
                console.log("Error! No data received. Showing error alert.");
                ctrl.errorToast("No data received.");
            }

            ctrl.loading = false;
            applyScope();
        };

        ctrl.fisherChange = function (selection) {
            ctrl.selectedFisher = selection;

            let currentResponseObs = [];

            if (ctrl.selectedFisher === "All") {
                currentResponseObs = rawResponseObs;
            } else {
                currentResponseObs[0] = angular.copy(rawResponseObs[0]
                    .filter(item => item.fisher_name === ctrl.selectedFisher));

                currentResponseObs[1] = angular.copy(rawResponseObs[1]);

                // Filter out the summaries
                let oldIncome = currentResponseObs[1];
                let newIncome = [];

                for (let i = 0; i < oldIncome.length; i++) {
                    // Start building new summaries
                    let newSummaries = [];

                    for (let j = 0; j < oldIncome[i].summaries.length; j++) {
                        if (oldIncome[i].summaries[j].fisher_name === ctrl.selectedFisher) {
                            newSummaries.push(oldIncome[i].summaries[j]);
                        }
                    }

                    // Only push into the new income object if
                    // there is a summary available for that fisher
                    if (newSummaries.length !== 0) {
                        newIncome.push({
                            "key" : oldIncome[i].key,
                            "summaries" : newSummaries,
                            "total" : newSummaries
                                .map(item => item.total)
                                .reduce((sum, summary) => sum + summary)
                        })
                    }
                }

                currentResponseObs[1] = newIncome;
            }

            // Map the data from the results
            expensesResponseDataObs = Rx.Observable
                .from(currentResponseObs[0]);
            incomeResponseDataObs = Rx.Observable
                .from(currentResponseObs[1]);

            // Set the months in the list
            collectMonths(expensesResponseDataObs, incomeResponseDataObs);

            // Update the available data
            updateData();
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

                // applyScope();

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
                    // $state.reload();
                });

            try {
                // Create the graph
                buildChartConfig(ctrl.expenses, ctrl.income);
                window.myPie.update();
            } catch (e) {
                console.log(e);
            }

            applyScope();
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
            // console.log(expensesResponseDataObs);
            return (isEmpty(expensesResponseDataObs) || isEmpty(incomeResponseDataObs));
        };

        ctrl.calcluateExpenseKey = function(input) {
            let month = input.month;
            let year = input.year;

            return `${year}-${month}`
        };


        const showError = function(err) {
            console.log(`Error: ${JSON.stringify(err, null, 4)}`);
            ctrl.loading = false;
            applyScope();
            // refreshBus.post(false);
        };

        function applyScope() {
            try {
                $scope.$apply();
            } catch (ex) {
                console.log("Scope apply already in progress!");
            }
        }

        ctrl.printify = function(input) {
            return JSON.stringify(input, null, 4)
        };

        ctrl.errorToast = function (error) {
            // alert("Error!" , error);
        };

        ctrl.getExpenseData = function () {
            return expensesResponseDataObs;
        };

        ctrl.getIncomedata = function () {
            return incomeResponseDataObs;
        };

        function resetLocalVariables() {
            expensesResponseDataObs = undefined;
            incomeResponseDataObs = undefined;
            rawResponseObs = undefined;
            ctrl.isManager = false;
            ctrl.selectedFisher = null;
        }

    }

}());
