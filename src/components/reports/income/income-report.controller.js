(function () {

    'use strict';

    angular
        .module('app')
        .component('incomeReport', {
            templateUrl: 'components/reports/income/income-report.template.html',
            controller: incomeReportController,
            bindings: {
                colors: '<',
                monthObs: '<',
                speciesList: '<'
            }
        });
    // .controller('incomeReportController', incomeReportController);

    incomeReportController.$inject = ['$state', '$scope', '$http', '$filter',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function incomeReportController($state, $scope, $http, $filter,
                                    $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        let ctrl = this;
        ctrl.loadings = false;

        // Pie chart config
        ctrl.chartConfigIncome = {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: [],
                    label: 'Income',
                    data: [],
                }]
            },
            options: {
                legend: {
                    // Disables the removal of data when legend items are clicked
                    onClick: function (event, legendItem) {
                        // todo NB: not sure if this method is fullproof
                        let dsmb = ctrl.myPieIncome.data.datasets[0]._meta;
                        let dsm;
                        for (let m in dsmb){
                            dsm = dsmb[m];
                            break;
                        }
                        let activeSegment = dsm.data[legendItem.index];
                        ctrl.myPieIncome.tooltip.initialize();
                        ctrl.myPieIncome.tooltip._active = [activeSegment];
                        ctrl.myPieIncome.tooltip.update();
                        dsm.controller.setHoverStyle(activeSegment);
                        ctrl.myPieIncome.render(ctrl.myPieIncome.options.hover.animationDuration, true);
                        dsm.controller.removeHoverStyle(activeSegment);
                    }
                },
                responsive: true,
                tooltips: {
                    position: 'nearest',
                    titleFontSize: 16,
                    bodyFontSize: 14,
                    bodySpacing: 8,
                    xPadding: 8,
                    yPadding: 8,
                    displayColors: false,
                    caretPadding: 8,
                    callbacks:{
                        title: function(data, chart) {
                            console.log('render title', data);
                            console.log('render title', chart);

                            return chart.labels[data[0].index];
                        },
                        label: function(data, chart){
                            console.log('render label', data);
                            console.log('render label', data[0]);
                            let s = ctrl.currentMonth.species[data.index];

                            let q = $filter('quantitiesKeysFilter')(s.quantities);

                            let labels = [];
                            for (let k in q) {
                                labels.push(($filter('quantitiesKeysTranslator')(k) || '') + ':' + ($filter('quantitiesValueSymbol')(q[k, k]) || ''));
                            }
                        
                            return labels;
                        },
                        afterLabel: function(data, chart){
                            console.log('render footer', data);
                            let inc = $filter('quantitiesIncome')(ctrl.currentMonth.species[data.index].quantities) || 0;
                            return 'Inkomste: ' + $filter('currency')(inc, 'R ', 2);
                        }
                    },
                }
            }
        };

        let ctxi = document.getElementById("income-chart-area-income").getContext("2d");
        // let ctxq = document.getElementById("income-chart-area-quantity").getContext("2d");
        ctrl.myPieIncome = new Chart(ctxi, ctrl.chartConfigIncome);
        // ctrl.myPieQuantity = new Chart(ctxq, ctrl.chartConfigQuantity);

        // ctrl.currentMonth = {
        //     month: 0,
        //     costs: []
        // };

        // let ctrl = this;
        // ctrl.loading = false;
        // ctrl.emailSending = false;
        // ctrl.showManagerList = false;
        // ctrl.validEmail = false;
        // let userId;
        // let mainEmailAddress;

        // let managedUsers;
        // let selectedReportUser;
        // ctrl.mainUserId

        /*============================================================================
                View enter
         ============================================================================*/
        ctrl.$onInit = function () {
            ctrl.loading = false;
            ctrl.monthObs.subscribe(m => ctrl.onMonthChange(m));
        };

        ctrl.onMonthChange = function (m) {
            if (typeof m === 'undefined' || m === null){
                return
            }
            console.log("income month change", m);
            console.log('colours list ', ctrl.colors);
            ctrl.currentMonth = m;
            ctrl.currentMonthTotal = ctrl.currentMonth.totalIncome;
            ctrl.currentMonthCosts = ctrl.currentMonth.totalCosts;
            ctrl.currentMonthProfits = ctrl.currentMonthTotal-ctrl.currentMonthCosts;
            buildChartConfig(ctrl.currentMonth);
            ctrl.myPieIncome.update();
            // ctrl.myPieQuantity.update();
        };

        // $scope.$on('$ionicView.enter', function() {
        //     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> start');
        //     resetLocalVariables();
        //
        //     ctrl.requestStatus = 0;
        //     ctrl.loading = true;

        // Promise.all([
        //     dataService.getEmailAddress(true)
        //         .then(processEmailSuccess)
        //         .catch(processEmailError),
        //
        //     dataService.getManagerUsers()
        //         .then(managedUsersSuccess)
        //         .catch(error => console.log(error))
        // ]).then(results => {
        //     // console.log("All calls have been made.");
        //     ctrl.loading = false;
        //     $scope.$apply();
        // }).catch(error => {
        //     console.log("Promise all error: ", error);
        //     ctrl.loading = false;
        //     $scope.$apply();
        // })
        // });

        function resetLocalVariables() {
            // userId = "";
            // mainEmailAddress = "";
        }

        const buildChartConfig = function (currentMonth) {
            console.log('building income chart config', currentMonth);
            let labels = [];
            let datasetsIncome = [];
            let datasetsQuantity = [];
            let colors = [];

            for (let i = 0; i < currentMonth.species.length; i = i + 1) {
                let label = currentMonth.species[i].name;
                labels.push($filter('speciesNameMapper')(label, ctrl.speciesList, 'afr'))
                datasetsIncome.push($filter('quantitiesIncome')(currentMonth.species[i].quantities))
                colors.push(ctrl.colors[i % ctrl.colors.length]);
            }

            ctrl.chartConfigIncome.data.labels = labels ;
            ctrl.chartConfigIncome.data.datasets[0].data = datasetsIncome;
            ctrl.chartConfigIncome.data.datasets[0].backgroundColor = colors;

            // ctrl.chartConfigQuantity.data.labels = labels;
            // ctrl.chartConfigQuantity.data.datasets[0].data = datasetsQuantity;
            // ctrl.chartConfigQuantity.data.datasets[0].backgroundColor = colours;
            // ctrl.chartConfig.options.tooltips =  {
            //     custom: ctrl.customTooltip,
            // }
        };
    }
}());
