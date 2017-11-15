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

    costReportController.$inject = ['$state', '$http',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil'];


    function costReportController($state, $http,
                                  $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil) {

        let ctrl = this;
        ctrl.loadings = false;

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
                legend: {
                    fontSize: 16,
                    // Disables the removal of data when legend items are clicked
                    onClick: function (event, legendItem) {
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
            console.log('building chart config', currentMonth);
            let labels = [];
            let datasets = [];
            let colours = [];

            // Expenses
            for (let i = 0; i < currentMonth.costs.length; i = i + 1) {

                console.log('cost engage')
                if (currentMonth.costs[i].value > 0) {
                    // Prettify label text
                    let label = currentMonth.costs[i].name;
                    let finalLabel = label.substring(0, 1).toUpperCase() + label.substring(1);

                    labels.push(finalLabel);
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
