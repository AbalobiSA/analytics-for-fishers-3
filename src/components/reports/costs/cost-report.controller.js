(function () {

    'use strict';

    angular
        .module('app')
        .component('costReportTab', {
            templateUrl: 'components/reports/costs/cost-report.template.html',
            controller: costReportController,
            bindings: {
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

        // ctrl.currentMonth = {
        //     month: 0,
        //     costs: []
        // };

        ctrl.colorMap = costColorMap;
        ctrl.patternMap = costPatternMap;
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
            ctrl.month = month;
            ctrl.currentMonthTotal = month.costs.reduce((acc, entry) => acc+entry.value, 0);
            buildChartConfig(month);
            ctrl.myPie.update();
        };

        // $scope.$on('$ionicView.loaded', function() {
        //     resetLocalVariables();
        //
        // ctrl.requestStatus = 0;
        // ctrl.loading = true;
        //
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
                    colours.push(costPatternMap[label])
                }
            }

            ctrl.chartConfig.data.labels = labels;
            ctrl.chartConfig.data.datasets[0].data = datasets;
            console.log('colours', colours);
            ctrl.chartConfig.data.datasets[0].backgroundColor = colours;
        };
    }

    const colors = [
        '#FF7B3A',
        '#FFC072',
        '#2E578C',
        '#7D807F',
        '#BC2D30',
        '#C9FF93',
        '#9D45B8'
    ];

    // const colors = [
    //     '#000000',
    //     '#000001',
    //     '#000002',
    //     '#000003',
    //     '#000004',
    //     '#000005',
    //     '#000006'
    // ];

    const patterns = pattern.generate(colors);

    const costColorMap = {
        'aas': colors[0],
        'voedsel': colors[1],
        'brandstof': colors[2],
        'hawe_fooi': colors[3],
        'olie': colors[4],
        'transport': colors[5],
        'ander': colors[6],
    };

    const costPatternMap = {
        'aas': patterns[0],
        'voedsel': patterns[1],
        'brandstof': patterns[2],
        'hawe_fooi': patterns[3],
        'olie': patterns[4],
        'transport': patterns[5],
        'ander': patterns[6],
    };

}());
