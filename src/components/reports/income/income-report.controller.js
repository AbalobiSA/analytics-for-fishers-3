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
        ctrl.myPieIncome = new Chart(ctxi, ctrl.chartConfigIncome);

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
            applyScope();
        };

        function resetLocalVariables() {}

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
        };

        function applyScope() {
            try {
                $scope.$apply();
            } catch (ex) {
                console.log("Scope apply already in progress!");
            }
        }
    }
}());
