(function () {

    'use strict';

    angular
        .module('app')
        .component('incomeReport', {
            templateUrl: 'components/reports/income/income-report.template.html',
            controller: incomeReportController,
            bindings: {
                monthObs: '<'
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
                    }
                },
                responsive: true,
                tooltips: {
                    position: 'nearest',
                    titleFontSize: 16,
                    bodyFontSize: 14,
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
                            let prefix = ctrl.currentMonth.species[data.index].denomination;
                            prefix = prefix.substring(0, 1).toUpperCase()+prefix.substring(1);
                            return prefix+': ' + ctrl.currentMonth.species[data.index].quantity + '\n';
                        },
                        afterLabel: function(data, chart){
                            console.log('render footer', data);
                            return 'Inkomste: ' + $filter('currency')(ctrl.currentMonth.species[data.index].value, 'R ', 2);
                        }
                    },
                    custom: function(tooltipModel) {
                        console.log('tooltipping');
                        // Tooltip Element
                        var tooltipEl = document.getElementById('chartjs-tooltip');

                        // Create element on first render
                        if (!tooltipEl) {
                            tooltipEl = document.createElement('div');
                            tooltipEl.id = 'chartjs-tooltip';
                            // tooltipEl.innerHTML = "<table></table>"
                            document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        if (tooltipModel.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Set caret Position
                        tooltipEl.classList.remove('above', 'below', 'no-transform');
                        if (tooltipModel.yAlign) {
                            tooltipEl.classList.add(tooltipModel.yAlign);
                        } else {
                            tooltipEl.classList.add('no-transform');
                        }

                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }

                        // Set Text
                        if (tooltipModel.body) {
                            console.log('tt body', tooltipModel);
                            let data = ctrl.currentMonth.species[tooltipModel.dataPoints[0].index];
                            console.log('data', data);
                            var titleLines = tooltipModel.title || [];
                            var bodyLines = tooltipModel.body.map(getBody);

                            var innerHtml = '<p>' + data.name + '</p><br/><p><strong>' + data.denomination + '</strong>: ' + data.quantity + '</p>';

                            // titleLines.forEach(function(title) {
                            //     innerHtml += '<tr><th>' + title + '</th></tr>';
                            // });
                            // innerHtml += '</thead><tbody>';

                            bodyLines.forEach(function(body, i) {
                                var colors = tooltipModel.labelColors[i];
                                var style = 'background:' + colors.backgroundColor;
                                style += '; border-color:' + colors.borderColor;
                                style += '; border-width: 2px';
                                var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                                innerHtml = span + innerHtml;
                            });
                            // innerHtml += '</tbody>';

                            // var tableRoot = tooltipEl.querySelector('table');
                            // tableRoot.innerHTML = innerHtml;
                            console.log('inner html', innerHtml);
                            tooltipEl.innerHTML = '';//innerHtml;
                        }

                        // `this` will be the overall tooltip
                        var position = this._chart.canvas.getBoundingClientRect();

                        // Display, position, and set styles for font
                        tooltipEl.style.opacity = 0.2;
                        tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
                        tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
                        tooltipEl.style.fontFamily = tooltipModel._fontFamily;
                        tooltipEl.style.fontSize = tooltipModel.fontSize;
                        tooltipEl.style.fontStyle = tooltipModel._fontStyle;
                        tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                    }

                }
            }
        };

        ctrl.chartConfigQuantity = {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: [],
                    label: 'Quantity',
                    data: [],
                }]
            },
            options: {
                legend: {
                    // Disables the removal of data when legend items are clicked
                    onClick: function (event, legendItem) {
                    }
                },
                responsive: true,
                tooltips: {
                    position: 'nearest',
                    titleFontSize: 16,
                    bodyFontSize: 14,
                    xPadding: 8,
                    yPadding: 8,
                    displayColors: false,
                    caretPadding: 8,
                    callbacks:{
                        title: function(data, chart) {
                            return chart.labels[data[0].index];
                        },
                        label: function(data, chart){
                            let prefix = ctrl.currentMonth.species[data.index].denomination;
                            prefix = prefix.substring(0, 1).toUpperCase()+prefix.substring(1);
                            return prefix+': ' + ctrl.currentMonth.species[data.index].quantity + '\n';
                        },
                        afterLabel: function(data, chart){
                            return 'Inkomste: ' + $filter('currency')(ctrl.currentMonth.species[data.index].value, 'R ', 2);
                        }
                    },
                    custom: function(tooltipModel) {
                        // Tooltip Element
                        var tooltipEl = document.getElementById('chartjs-tooltip');

                        // Create element on first render
                        if (!tooltipEl) {
                            tooltipEl = document.createElement('div');
                            tooltipEl.id = 'chartjs-tooltip';
                            // tooltipEl.innerHTML = "<table></table>"
                            document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        if (tooltipModel.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Set caret Position
                        tooltipEl.classList.remove('above', 'below', 'no-transform');
                        if (tooltipModel.yAlign) {
                            tooltipEl.classList.add(tooltipModel.yAlign);
                        } else {
                            tooltipEl.classList.add('no-transform');
                        }

                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }

                        // Set Text
                        if (tooltipModel.body) {
                            let data = ctrl.currentMonth.species[tooltipModel.dataPoints[0].index];
                            var titleLines = tooltipModel.title || [];
                            var bodyLines = tooltipModel.body.map(getBody);

                            var innerHtml = '<p>' + data.name + '</p><br/><p><strong>' + data.denomination + '</strong>: ' + data.quantity + '</p>';

                            // titleLines.forEach(function(title) {
                            //     innerHtml += '<tr><th>' + title + '</th></tr>';
                            // });
                            // innerHtml += '</thead><tbody>';

                            bodyLines.forEach(function(body, i) {
                                var colors = tooltipModel.labelColors[i];
                                var style = 'background:' + colors.backgroundColor;
                                style += '; border-color:' + colors.borderColor;
                                style += '; border-width: 2px';
                                var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                                innerHtml = span + innerHtml;
                            });
                            // innerHtml += '</tbody>';

                            // var tableRoot = tooltipEl.querySelector('table');
                            // tableRoot.innerHTML = innerHtml;
                            tooltipEl.innerHTML = '';//innerHtml;
                        }

                        // `this` will be the overall tooltip
                        var position = this._chart.canvas.getBoundingClientRect();

                        // Display, position, and set styles for font
                        tooltipEl.style.opacity = 0.2;
                        tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
                        tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
                        tooltipEl.style.fontFamily = tooltipModel._fontFamily;
                        tooltipEl.style.fontSize = tooltipModel.fontSize;
                        tooltipEl.style.fontStyle = tooltipModel._fontStyle;
                        tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                    }

                }
            }
        };

        let ctxi = document.getElementById("income-chart-area-income").getContext("2d");
        let ctxq = document.getElementById("income-chart-area-quantity").getContext("2d");
        ctrl.myPieIncome = new Chart(ctxi, ctrl.chartConfigIncome);
        ctrl.myPieQuantity = new Chart(ctxq, ctrl.chartConfigQuantity);

        // ctrl.currentMonth = {
        //     month: 0,
        //     costs: []
        // };

        ctrl.colorMap = speciesColorMap;
        ctrl.imageMap = speciesImageMap;

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

        ctrl.onMonthChange = function (month) {
            ctrl.currentMonth = month;
            ctrl.currentMonthTotal = ctrl.currentMonth.species.reduce((acc, entry) => acc + entry.value, 0);
            let currentMonthCosts = month.costs.reduce((acc, entry) => acc+entry.value, 0);
            ctrl.currentMonthProfits = ctrl.currentMonthTotal-currentMonthCosts;
            buildChartConfig(ctrl.currentMonth);
            ctrl.myPieIncome.update();
            ctrl.myPieQuantity.update();
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
            let colours = [];

            // Expenses
            for (let i = 0; i < currentMonth.species.length; i = i + 1) {

                if (currentMonth.species[i].value > 0) {
                    // Prettify label text
                    let label = currentMonth.species[i].name;
                    let finalLabel = label.substring(0, 1).toUpperCase() + label.substring(1);

                    labels.push(finalLabel);
                    datasetsIncome.push(currentMonth.species[i].value);
                    datasetsQuantity.push(currentMonth.species[i].quantity);
                    colours.push(speciesPatternMap[label])
                }
            }

            ctrl.chartConfigIncome.data.labels = labels;
            ctrl.chartConfigIncome.data.datasets[0].data = datasetsIncome;
            ctrl.chartConfigIncome.data.datasets[0].backgroundColor = colours;

            ctrl.chartConfigQuantity.data.labels = labels;
            ctrl.chartConfigQuantity.data.datasets[0].data = datasetsQuantity;
            ctrl.chartConfigQuantity.data.datasets[0].backgroundColor = colours;
            // ctrl.chartConfig.options.tooltips =  {
            //     custom: ctrl.customTooltip,
            // }
        };
    }

    const colors = [
        '#9AE34F',
        '#FF7400',
        '#FFEB3B',
        '#E91E63',
        '#009688',
        '#795548'
    ];

    const patterns = pattern.generate(colors);

    const speciesColorMap = {
        'snoek': colors[0],
        'cape_bream': colors[1],
        'geelstert': colors[2],
        'jacobpever': colors[3],
        'knorhaan': colors[4],
        'kreef': colors[5],
    };

    const speciesPatternMap = {
        'snoek': patterns[0],
        'cape_bream': patterns[1],
        'geelstert': patterns[2],
        'jacobpever': patterns[3],
        'knorhaan': patterns[4],
        'kreef': patterns[5],
    };

    const speciesImageMap = {
        'snoek': 'components/reports/income/img/snoek_200.png',
        'cape_bream': 'components/reports/income/img/capebream_200.png',
        'geelstert': 'components/reports/income/img/yellowtail_200.png',
        'jacobpever': 'components/reports/income/img/jacopever_200.png',
        'knorhaan': 'components/reports/income/img/gurnard_200.png',
        'kreef': 'components/reports/income/img/wclobster_200.png',
    };

}());
