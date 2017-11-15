(function () {

    'use strict';

    angular
        .module('app')
        .component('costReportTab', {
            templateUrl: 'components/reports/costs/cost-report.template.html',
            controller: costReportController,
            bindings: {
                colors: '<',
                monthObs: '<'
            }
        });

    costReportController.$inject = ['$state', '$http', '$filter',  'Analytics',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];


    function costReportController($state, $http, $filter, ganalytics,
                                  $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        let ctrl = this;
        ctrl.loadings = false;

        let chartPsuedoClickCount = -1;
        let chartLegendPsuedoClickCount = -1;

        // Pie chart config
        ctrl.chartConfig = {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: [],
                    label: 'Expenses',
                    data: [],
                }]
            },
            options: {
                onClick: function(evt) {
                    if(evt.offsetY > 60) {
                        chartPsuedoClickCount += 1;
                        ganalytics.trackEvent('report_costs', 'click_chart', undefined, chartPsuedoClickCount);
                    }
                },
                legend: {
                    fontSize: 16,
                    // Disables the removal of data when legend items are clicked
                    onClick: function (event, legendItem) {
                        if(event.offsetY < 60) {
                            chartLegendPsuedoClickCount += 1;
                            ganalytics.trackEvent('report_costs', 'click_chart_legend', undefined, chartLegendPsuedoClickCount);
                        }
                        // todo NB: not sure if this method is fullproof
                        let dsmb = ctrl.myPie.data.datasets[0]._meta;
                        let dsm;
                        for (let m in dsmb){
                            dsm = dsmb[m];
                            break;
                        }
                        let activeSegment = dsm.data[legendItem.index];
                        ctrl.myPie.tooltip.initialize();
                        ctrl.myPie.tooltip._active = [activeSegment];
                        ctrl.myPie.tooltip.update();
                        dsm.controller.setHoverStyle(activeSegment);
                        ctrl.myPie.render(ctrl.myPie.options.hover.animationDuration, true);
                        dsm.controller.removeHoverStyle(activeSegment);
                    }
                },
                responsive: true,
                tooltips: {
                    bodyFontSize: 14,
                    xPadding: 8,
                    yPadding: 8,
                    displayColors: false,
                    caretPadding: 8,
                }
            }
        };

        let ctx = document.getElementById("cost-chart-area").getContext("2d");
        ctrl.myPie = new Chart(ctx, ctrl.chartConfig);

        /*============================================================================
                View enter
         ============================================================================*/
        ctrl.$onInit = function () {
            ganalytics.trackPage('/app/reports/costs', 'costs');
            ganalytics.trackEvent('costs', 'page_enter');
            ctrl.loading = false;
            ctrl.monthObs.subscribe(m => ctrl.onMonthChange(m));
        };

        ctrl.onMonthChange = function (m) {
            if (typeof m === 'undefined' || m === null){
                return
            }
            ctrl.month = m;
            ctrl.currentMonthTotal = ctrl.month.totalCosts;
            buildChartConfig(ctrl.month);
            ctrl.myPie.update();
            applyScope();
        };

        function resetLocalVariables() {}

        const buildChartConfig = function (currentMonth) {
            let labels = [];
            let datasets = [];
            let colours = [];

            // Expenses
            for (let i = 0; i < currentMonth.costs.length; i = i + 1) {
                if (currentMonth.costs[i].value > 0) {
                    // Prettify label text
                    let label = currentMonth.costs[i].name;
                    label = $filter('costKeysTranslator')(label);
                    label = $filter('capitalizeKeys')(label);

                    labels.push(label);
                    datasets.push(currentMonth.costs[i].value);
                    colours.push(ctrl.colors[i % ctrl.colors.length]);
                }
            }

            ctrl.chartConfig.data.labels = labels;
            ctrl.chartConfig.data.datasets[0].data = datasets;
            ctrl.chartConfig.data.datasets[0].backgroundColor = colours;
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
