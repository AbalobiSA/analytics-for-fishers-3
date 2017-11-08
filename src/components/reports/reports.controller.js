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
        let responseObs, rawResponseObs;

        ctrl.seaDaysTabSelected = true;
        ctrl.incomeTabSelected = false;
        ctrl.expensesTabSelected = false;
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

/*============================================================================
        Ionic Methods
 ============================================================================*/

        $scope.$on('$ionicView.enter', function() {
            resetLocalVariables();
            // if (!ctrl.loading) {
            //     ctrl.loading = true;
            //     ctrl.seaDaysTabSelected = true;
            //     requestData();
            // }
        });

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
//         function requestData(){
//             console.log("DEBUG: Requesting data...");
//             ctrl.loading = true;
//             sfdata.queryExpensesIncomeByTimePeriod(ctrl.selectedInterval, false)
//                 .then(handleResponse)
//                 .catch(showError);
//         }
//
//         ctrl.requestFreshData = function () {
//             ctrl.loading = true;
//             sfdata.queryExpensesIncomeByTimePeriod(ctrl.selectedInterval, true)
//                 .then(handleResponse)
//                 .catch(showError);
//         };
//
//         ctrl.requestData = requestData;
//
//         const buildChartConfig = function (expense, income) {
//             let labels = [];
//             let datasets = [];
//
//             // Expenses
//             let costs = Object.keys(expense).filter(prop => prop.startsWith("cost_"));
//             for (let i = 0; i < costs.length; i = i + 1) {
//                 if (expense[costs[i]] > 0) {
//                     // Prettify label text
//                     let parts = costs[i].split('_');
//                     parts = parts.slice(1);
//                     parts = parts.map(part => [String(part).substring(0, 1).toUpperCase(), String(part).substring(1)].join(''));
//
//                     labels.push(parts.join(' '));
//                     datasets.push(expense[costs[i]]);
//                 }
//             }
//
//             ctrl.chartConfig.data.labels = labels;
//             ctrl.chartConfig.data.datasets[0].data = datasets;
//         };
//
//         const handleFisherListResponse = function (fList) {
//             if(ctrl.isManager){
//                 fList.filter(fList => ctrl.selectedFisher === null)
//                     .subscribe(fList => {
//                         ctrl.fisherList = sfdata.BASE_FISHER_LIST.concat(fList);
//                         ctrl.selectedFisher = ctrl.fisherList[0];
//                         ctrl.fisherChange(ctrl.selectedFisher);
//                     });
//             }
//         };
//
//         const handleResponse = function(response){
//             console.log("DEBUG: Response received. Logging info now...");
//             console.log(JSON.stringify(response));
//
//             let currentResults = response.data.results;
//             rawResponseObs = response.data.results;
//             ctrl.isManager = response.data.is_manager;
//
//             if (currentResults !== undefined) {
//                 console.log("DEBUG: Handling expenses/income response");
//                 try{
//                     // Debug output
//                     console.log(currentResults[0]);
//                     console.log(currentResults[1]);
//                     console.log(currentResults[2]);
//
//                     // Populate the fisher list
//                     console.log("Populating the list of fishers");
//                     let fishers = [];
//                     for (let record of currentResults[2]){
//                         if (record.lkup_main_fisher_id__r.Name && (fishers.indexOf(record.lkup_main_fisher_id__r.Name) === -1)) {
//                             fishers.push(record.lkup_main_fisher_id__r.Name);
//                         }
//                     }
//
//                     // Add the All option to the list
//                     // fishers.push("All");\
//                     console.log("Sorting the list of fishers...");
//                     fishers = fishers.sort();
//                     console.log("Setting the fisher list controller item...");
//                     ctrl.fisherList = fishers;
//
//                     // Default selection to All
//                     console.log("Selecting the first fisher...");
//                     ctrl.selectedFisher = ctrl.fisherList[0];
//
//                     console.log("Mapping the data now...");
//                     // Map the data from the results
//                     expensesResponseDataObs = Rx.Observable.from(currentResults[0]);
//                     incomeResponseDataObs = Rx.Observable.from(currentResults[1]);
//                 } catch (ex) {
//                     console.log(ex);
//                     console.log(ex.toString());
//                     ctrl.loading = false;
//                 }
//
//                 // Filter the available months in the list
//                 collectMonths(expensesResponseDataObs, incomeResponseDataObs);
//
//                 ctrl.fisherChange(ctrl.selectedFisher);
//             } else {
//                 console.log("Error! No data received. Showing error alert.");
//                 ctrl.errorToast("No data received.");
//             }
//
//             ctrl.loading = false;
//             applyScope();
//         };
//
//         ctrl.fisherChange = function (selection) {
//             ctrl.selectedFisher = selection;
//
//             let currentResponseObs = [];
//
//             if (ctrl.selectedFisher === "All") {
//                 currentResponseObs = rawResponseObs;
//             } else {
//                 currentResponseObs[0] = angular.copy(rawResponseObs[0]
//                     .filter(item => item.fisher_name === ctrl.selectedFisher));
//
//                 currentResponseObs[1] = angular.copy(rawResponseObs[1]);
//
//                 // Filter out the summaries
//                 let oldIncome = currentResponseObs[1];
//                 let newIncome = [];
//
//                 for (let i = 0; i < oldIncome.length; i++) {
//                     // Start building new summaries
//                     let newSummaries = [];
//
//                     for (let j = 0; j < oldIncome[i].summaries.length; j++) {
//                         if (oldIncome[i].summaries[j].fisher_name === ctrl.selectedFisher) {
//                             newSummaries.push(oldIncome[i].summaries[j]);
//                         }
//                     }
//
//                     // Only push into the new income object if
//                     // there is a summary available for that fisher
//                     if (newSummaries.length !== 0) {
//                         newIncome.push({
//                             "key" : oldIncome[i].key,
//                             "summaries" : newSummaries,
//                             "total" : newSummaries
//                                 .map(item => item.total)
//                                 .reduce((sum, summary) => sum + summary)
//                         })
//                     }
//                 }
//
//                 currentResponseObs[1] = newIncome;
//             }
//
//             // Map the data from the results
//             expensesResponseDataObs = Rx.Observable.from(currentResponseObs[0]);
//             incomeResponseDataObs = Rx.Observable.from(currentResponseObs[1]);
//
//             // Set the months in the list
//             collectMonths(expensesResponseDataObs, incomeResponseDataObs);
//
//             // Update the available data
//             updateData();
//         };
//
//         ctrl.intervalChange = function(selection) {
//             requestData();
//         };
//
//         ctrl.monthChange = function(selection){
//             updateData();
//         };
//
//         function collectMonths(expensesObs, incomeObs) {
//             let expMonths = expensesObs.map(record => sfdata.groupByInterval(ctrl.selectedInterval, record));
//             let incMonths = incomeObs.map(record => record.key);
//
//             let newMonths1 = expMonths.concat(incMonths)
//                 .toArray()
//                 .map(months => new Set(months).values())
//                 .map(monthSetIterable => Array.from(monthSetIterable));
//
//             newMonths1.flatMap( arr => Rx.Observable.from(arr))
//                 .map( x => convertToDate(x))
//                 .toArray()
//                 .map(months => months.sort(ResultsUtil.dateComparator))
//                 .map(months => months.reverse())
//                 .map(months => months.map(convertToDateString))
//                 .subscribe(months => {
//                     ctrl.months = months;
//                     let index = ctrl.months.indexOf(ctrl.selectedMonth);
//                     if (index < 0) {
//                         index = 0;
//                     }
//
//                     ctrl.selectedMonth = ctrl.months[index];
//                     ctrl.monthChange(ctrl.selectedMonth);
//                 });
//         }
//
//         function updateData() {
//             let formattedExpense = expensesResponseDataObs
//                 .filter(record => sfdata.groupByInterval(ctrl.selectedInterval, record) === ctrl.selectedMonth.replace("-0", "-"))
//                 .doOnNext(record => {
//                     record['total'] = Object.keys(record)
//                         .filter(prop => prop.startsWith("cost_"))
//                         .reduce((tot, prop) => tot + (record[prop] || 0), 0);
//                 })
//                 .defaultIfEmpty({total:"N/A"});
//
//             let formattedIncome = incomeResponseDataObs
//                 .filter(record => record.key === ctrl.selectedMonth.replace("-0", "-"))
//                 .defaultIfEmpty({total:"N/A"});
//
//             Rx.Observable.concat(formattedExpense, formattedIncome)
//                 .toArray()
//                 .subscribe(data => {
//                     ctrl.expenses = data[0];
//                     ctrl.income = data[1];
//                     // $state.reload();
//                 });
//
//             try {
//                 // Update the graph
//                 buildChartConfig(ctrl.expenses, ctrl.income);
//                 if (ctrl.showChart === true) {
//                     ctrl.myPie.update();
//                 }
//             } catch (e) {
//                 console.log(e);
//             }
//
//             applyScope();
//         }
//
//         const collectExpensesTotals = function(acc, entry){
//             console.log("agg expenses => "+acc);
//             console.log(entry);
//             let total = Object.keys(entry)
//                 .filter(prop => prop.startsWith("cost_"))
//                 .reduce((tot, prop) => tot + (entry[prop] || 0), 0);
//             return acc + total;
//         };
//
//         const collectIncomeTotals = function(acc, entry) {
//             let priceProps = Object.keys(entry)
//                 .filter(prop => prop.startsWith("price_"));
//
//             let batchPrice = priceProps
//                 .filter(prop => prop === "price_batch")
//                 .map(prop => entry[prop] || 0);
//
//             let anderPrices = priceProps
//                 .filter(prop => prop !== "price_batch")
//                 .reduce((tot, prop) =>{
//                     let propId = "sold_"+prop.split('_')[1]; //Gets the type (ie. crates, items, weight)
//                     let value = (entry[prop] || 0)*(entry[propId] || 0);
//                     return tot+value
//                 }, 0);
//             return acc+batchPrice+anderPrices;
//         };
//
//         const convertToDate = function(dateString) {
//             let yearMonth = dateString.split('-');
//             let tempDate = new Date(yearMonth[0], yearMonth[1]-1, 1);
//             return tempDate;
//         };
//
//         const convertToDateString = function(date) {
//             let year = date.getFullYear();
//             let month = date.getMonth()+1;
//             if(month < 10){
//                 month = "0"+month;
//             }
//             return year+"-"+month;
//         };
//
//         function isEmpty(input) {
//             return (input === undefined || input === null || input === "");
//         }
//
// /*============================================================================
//      Utility Methods
//  ============================================================================*/
//         ctrl.noDataExists = function() {
//             // console.log(expensesResponseDataObs);
//             return (isEmpty(expensesResponseDataObs) || isEmpty(incomeResponseDataObs));
//         };
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

        // ctrl.hasData = function(income, expense, input, input2) {
        //     return (input !== undefined || (input2.month !== undefined && input2.year !== undefined)) !== undefined && (income.total !== 'N/A' || expense.total !== 'N/A');
        // };


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

        const data = {

            months: [
                {
                    month: 1504224000000, //sept
                    costs: [
                        {name: 'aas', value: 600},
                        {name: 'voedsel', value: 100},
                        {name: 'brandstof', value: 2850},
                        {name: 'hawe_fooi', value: 150},
                        {name: 'olie', value: 400},
                        {name: 'transport', value: 300},
                        {name: 'ander', value: 400},
                    ],
                    profit: 6398,
                    species: [
                        {name: 'snoek', quantity: 55, denomination:'totale', value: 2731},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 3, out: true, catch:true, species:['snoek']},
                        {day: 4, out: true, catch:true, species:['snoek']},
                        {day: 5, out: true, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 6, out: true, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 7, out: true, catch:false, species:[], reason: 'Slegte Weer'},
                    ]
                },
                {
                    month: 1501545600000, //august
                    costs: [
                        {name: 'aas', value: 3540},
                        {name: 'voedsel', value: 200},
                        {name: 'brandstof', value: 11850},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 2587},
                        {name: 'transport', value: 2100},
                        {name: 'ander', value: 1092},
                    ],
                    profit: 6398,
                    species: [
                        {name: 'snoek', quantity: 654, denomination:'totale', value: 28231},
                        {name: 'cape_bream', quantity: 300, denomination:'totale', value: 5345},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: false, catch:false, species:[], reason: 'Boot buitewerking'},
                        {day: 3, out: true, catch:true, species:['snoek']},
                        {day: 4, out: true, catch:true, species:['snoek']},
                        {day: 5, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 6, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['cape_bream']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: true, catch:true, species:['snoek']},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: true, catch:true, species:['snoek']},
                        {day: 15, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['snoek']},
                        {day: 21, out: true, catch:true, species:['snoek']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 24, out: true, catch:true, species:['cape_bream']},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 28, out: false, catch:false, species:[]},
                        {day: 29, out: true, catch:true, species:['snoek']},
                        {day: 30, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 31, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                    ]
                },
                {
                    month: 1498867200000, //july
                    costs: [
                        {name: 'aas', value: 1640},
                        {name: 'voedsel', value: 100},
                        {name: 'brandstof', value: 9850},
                        {name: 'hawe_fooi', value: 1400},
                        {name: 'olie', value: 1000},
                        {name: 'transport', value: 2000},
                        {name: 'ander', value: 213},
                    ],
                    profit: 2576,
                    species: [
                        {name: 'snoek', quantity: 717, denomination:'totale', value: 21221},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: false, catch:false, species:[], reason: 'Boot buitewerking'},
                        {day: 3, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 4, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 5, out: true, catch:true, species:['snoek']},
                        {day: 6, out: true, catch:true, species:['snoek']},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['snoek']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: true, catch:true, species:['snoek']},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 15, out: true, catch:true, species:['snoek']},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['snoek']},
                        {day: 21, out: true, catch:true, species:['snoek']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 27, out: true, catch:true, species:['snoek']},
                        {day: 28, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 29, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 30, out: true, catch:true, species:['snoek']},
                        {day: 31, out: false, catch:false, species:[]},
                    ]
                },
                {
                    month: 1496275200000, //june
                    costs: [
                        {name: 'aas', value: 6000},
                        {name: 'voedsel', value: 150},
                        {name: 'brandstof', value: 10350},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1500},
                        {name: 'transport', value: 1200},
                        {name: 'ander', value: 2984},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'snoek', quantity: 719, denomination:'totale', value: 23849},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: false, catch:false, species:[], reason: 'Boot buitewerking'},
                        {day: 3, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 4, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 5, out: true, catch:true, species:['snoek']},
                        {day: 6, out: true, catch:true, species:['snoek']},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['snoek']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: true, catch:true, species:['snoek']},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 15, out: true, catch:true, species:['snoek']},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['snoek']},
                        {day: 21, out: true, catch:true, species:['snoek']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 27, out: true, catch:true, species:['snoek']},
                        {day: 28, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 29, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 30, out: true, catch:true, species:['snoek']},
                    ]
                },
                {
                    month: 1493596800000, //may
                    costs: [
                        {name: 'aas', value: 2123},
                        {name: 'voedsel', value: 300},
                        {name: 'brandstof', value: 8650},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1000},
                        {name: 'transport', value: 1400},
                        {name: 'ander', value: 184},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'snoek', quantity: 973, denomination:'totale', value: 14849},
                        {name: 'knorhaan', quantity: 103, denomination:'totale', value: 2149}, //gurnards
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: false, catch:false, species:[], reason: 'Boot buitewerking'},
                        {day: 3, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 4, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 5, out: true, catch:true, species:['snoek']},
                        {day: 6, out: true, catch:true, species:['snoek']},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['snoek']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: true, catch:true, species:['snoek']},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 15, out: true, catch:true, species:['snoek']},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['knorhaan', 'snoek']},
                        {day: 21, out: true, catch:true, species:['knorhann']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:false, species:[], reason: 'Suiwerskoon water en koud'},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 27, out: true, catch:true, species:['snoek']},
                        {day: 28, out: true, catch:true, species:['snoek']},
                        {day: 29, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 30, out: true, catch:true, species:['snoek']},
                        {day: 31, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                    ]
                },
                {
                    month: 1491004800000, //april
                    costs: [
                        {name: 'aas', value: 6000},
                        {name: 'voedsel', value: 150},
                        {name: 'brandstof', value: 12350},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1500},
                        {name: 'transport', value: 1200},
                        {name: 'ander', value: 2984},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'snoek', quantity: 1420, denomination:'totale', value: 28231},
                        {name: 'geelstert', quantity: 421, denomination:'totale', value: 5345},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 2, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 3, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 4, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 5, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 6, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['snoek']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: true, catch:true, species:['snoek']},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: true, catch:true, species:['snoek']},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: true, catch:true, species:['snoek']},
                        {day: 15, out: true, catch:true, species:['snoek']},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: true, catch:true, species:['snoek']},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['snoek']},
                        {day: 21, out: true, catch:true, species:['snoek']},
                        {day: 22, out: true, catch:true, species:['snoek']},
                        {day: 23, out: true, catch:true, species:['snoek']},
                        {day: 24, out: true, catch:true, species:['snoek']},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 27, out: true, catch:true, species:['snoek']},
                        {day: 28, out: true, catch:true, species:['snoek']},
                        {day: 29, out: true, catch:true, species:['snoek']},
                        {day: 30, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                    ]
                },
                {
                    month: 1488326400000, //march
                    costs: [
                        {name: 'aas', value: 2100},
                        {name: 'voedsel', value: 150},
                        {name: 'brandstof', value: 9150},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1100},
                        {name: 'transport', value: 1300},
                        {name: 'ander', value: 984},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'snoek', quantity: 389, denomination:'totale', value: 10849},
                        {name: 'geelstert', quantity: 237, denomination:'totale', value: 4449},
                        {name: 'jacobpever', quantity: 150, denomination:'totale', value: 3849},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['snoek']},
                        {day: 2, out: true, catch:true, species:['snoek']},
                        {day: 3, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 4, out: true, catch:true, species:['jacobpever']},
                        {day: 5, out: true, catch:true, species:['snoek']},
                        {day: 6, out: true, catch:false, species:[], reason: 'Geen byt gekry nie'},
                        {day: 7, out: true, catch:true, species:['snoek']},
                        {day: 8, out: true, catch:true, species:['snoek']},
                        {day: 9, out: true, catch:true, species:['snoek']},
                        {day: 10, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 11, out: true, catch:true, species:['snoek']},
                        {day: 12, out: true, catch:true, species:['snoek']},
                        {day: 13, out: true, catch:true, species:['snoek']},
                        {day: 14, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 15, out: true, catch:true, species:['snoek']},
                        {day: 16, out: true, catch:true, species:['jacobpever']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[]},
                        {day: 20, out: true, catch:true, species:['snoek']},
                        {day: 21, out: true, catch:true, species:['snoek']},
                        {day: 22, out: true, catch:true, species:['jacobpever']},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:true, species:['snoek']},
                        {day: 25, out: true, catch:true, species:['snoek']},
                        {day: 26, out: true, catch:true, species:['snoek']},
                        {day: 27, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 28, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 29, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 30, out: true, catch:true, species:['snoek', 'geelstert']},
                        {day: 31, out: true, catch:true, species:['snoek', 'geelstert']},
                    ]
                },
                {
                    month: 1485907200000, //feb
                    costs: [
                        {name: 'aas', value: 6000},
                        {name: 'voedsel', value: 150},
                        {name: 'brandstof', value: 10350},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1500},
                        {name: 'transport', value: 1200},
                        {name: 'ander', value: 2984},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'kreef', quantity: 23, denomination:'kratte', value: 42849}, //todo find out amount per crate of lobster
                        {name: 'jacobpever', quantity: 354, denomination:'totale', value: 6499},
                        {name: 'snoek', quantity: 100, denomination:'totale', value: 2500},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['kreef']},
                        {day: 5, out: true, catch:true, species:['kreef']},
                        {day: 6, out: true, catch:true, species:['kreef']},
                        {day: 7, out: true, catch:true, species:['kreef']},
                        {day: 8, out: true, catch:true, species:['kreef']},
                        {day: 9, out: true, catch:true, species:['kreef']},
                        {day: 10, out: true, catch:true, species:['kreef']},
                        {day: 11, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 12, out: true, catch:true, species:['jacobpever']},
                        {day: 13, out: true, catch:true, species:['jacobpever']},
                        {day: 14, out: true, catch:true, species:['jacobpever']},
                        {day: 15, out: true, catch:true, species:['jacobpever']},
                        {day: 16, out: true, catch:true, species:['snoek']},
                        {day: 17, out: true, catch:true, species:['snoek']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 20, out: true, catch:true, species:['kreef']},
                        {day: 21, out: true, catch:true, species:['kreef']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:true, species:['jacobpever']},
                        {day: 25, out: true, catch:true, species:['jacobpever']},
                        {day: 26, out: true, catch:true, species:['jacobpever']},
                        {day: 27, out: true, catch:true, species:['jacobpever', 'snoek']},
                        {day: 28, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'}
                    ]
                },
                {
                    month: 1483228800000, //jan
                    costs: [
                        {name: 'aas', value: 6000},
                        {name: 'voedsel', value: 150},
                        {name: 'brandstof', value: 10350},
                        {name: 'hawe_fooi', value: 1000},
                        {name: 'olie', value: 1500},
                        {name: 'transport', value: 1200},
                        {name: 'ander', value: 2984},
                    ],
                    profit: 4788,
                    species: [
                        {name: 'kreef', quantity: 47, denomination:'kratte', value: 56849},
                    ],
                    days: [
                        {day: 1, out: true, catch:true, species:['kreef']},
                        {day: 5, out: true, catch:true, species:['kreef']},
                        {day: 6, out: true, catch:true, species:['kreef']},
                        {day: 7, out: true, catch:true, species:['kreef']},
                        {day: 8, out: true, catch:true, species:['kreef']},
                        {day: 9, out: true, catch:true, species:['kreef']},
                        {day: 10, out: true, catch:true, species:['kreef']},
                        {day: 11, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 12, out: true, catch:true, species:['kreef']},
                        {day: 13, out: true, catch:true, species:['kreef']},
                        {day: 14, out: true, catch:true, species:['kreef']},
                        {day: 15, out: true, catch:true, species:['kreef']},
                        {day: 16, out: true, catch:true, species:['kreef']},
                        {day: 17, out: true, catch:true, species:['kreef']},
                        {day: 18, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 19, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 20, out: true, catch:true, species:['kreef']},
                        {day: 21, out: true, catch:true, species:['kreef']},
                        {day: 22, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 23, out: false, catch:false, species:[], reason: 'Slegte Weer'},
                        {day: 24, out: true, catch:true, species:['jacobpever']},
                        {day: 25, out: true, catch:true, species:['jacobpever']},
                        {day: 26, out: true, catch:true, species:['jacobpever']},
                        {day: 27, out: true, catch:true, species:['jacobpever', 'kreef']},
                        {day: 28, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 29, out: true, catch:false, species:[], reason: 'Vis nou nie byt nie'},
                        {day: 30, out: true, catch:true, species:['kreef']},
                        {day: 31, out: true, catch:true, species:['kreef']},
                    ]
                }
            ],
        };

        const setTitle = function() {
            ctrl.title = 'Verslag -  '+ ctrl.sm + ' ' +ctrl.years[0];
        };

        ctrl.$postLink = function() {
            ctrl.qazwsx = 'qweasdzc';
        };

        ctrl.years = [2017];
        ctrl.selectedYear = ['September', 'Augustus', 'Julie', 'Junie', 'Mei', 'April', 'Maart', 'Februarie', 'Januarie'];
        ctrl.sm = ctrl.selectedYear[0];
        ctrl.selectedMonth = data.months[0];
        setTitle();

        const monthSubject = new Rx.BehaviorSubject(ctrl.selectedMonth);
        ctrl.monthObs = monthSubject.asObservable();
        ctrl.monthChange = function(index) {
            console.log('month change', index);

            let i = Math.max(ctrl.selectedYear.indexOf(index), 0);
            console.log('month change', i);

            ctrl.selectedMonth = data.months[i];
            ctrl.sm = ctrl.selectedYear[i];
            setTitle();
            monthSubject.onNext(ctrl.selectedMonth)
        };
    }

}());
