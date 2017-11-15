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

    incomeReportController.$inject = ['$state', '$scope', '$http', '$filter', 'Analytics',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];

    function incomeReportController($state, $scope, $http, $filter, ganalytics,
                                    $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        let ctrl = this;
        ctrl.loadings = false;

        let chartPsuedoClickCount = -1;
        let chartLegendPsuedoClickCount = -1;

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
                onClick: function(evt) {
                    if(evt.offsetY > 60) {
                        chartPsuedoClickCount += 1;
                        ganalytics.trackEvent('report_income', 'click_chart', undefined, chartPsuedoClickCount);
                    }
                },
                legend: {
                    onClick: function (event, legendItem) {
                        if(event.offsetY < 60) {
                            chartLegendPsuedoClickCount += 1;
                            ganalytics.trackEvent('report_seadays', 'click_chart_legend', undefined, chartLegendPsuedoClickCount);
                        }
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
                            return chart.labels[data[0].index];
                        },
                        label: function(data, chart){
                            let s = ctrl.currentMonth.species[data.index];

                            let q = $filter('quantitiesKeysFilter')(s.quantities);

                            let labels = [];
                            for (let k in q) {
                                labels.push(($filter('quantitiesKeysTranslator')(k) || '') + ':' + ($filter('quantitiesValueSymbol')(q[k, k]) || ''));
                            }
                        
                            return labels;
                        },
                        afterLabel: function(data, chart){
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
            ganalytics.trackPage('/app/reports/income', 'income');
            ganalytics.trackEvent('income', 'page_enter');
            ctrl.loading = false;
            ctrl.monthObs.subscribe(m => ctrl.onMonthChange(m));
        };

        ctrl.onMonthChange = function (m) {
            if (typeof m === 'undefined' || m === null){
                return
            }
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
            let labels = [];
            let datasetsIncome = [];
            let datasetsQuantity = [];
            let colors = [];

            for (let i = 0; i < currentMonth.species.length; i = i + 1) {
                let label = currentMonth.species[i].name;
                labels.push($filter('listKeyMapper')(label, ctrl.speciesList, 'afr'))
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
