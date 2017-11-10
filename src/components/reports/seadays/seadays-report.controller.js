(function () {

    'use strict';

    angular
        .module('app')
        .component('seadaysReport', {
            templateUrl: 'components/reports/seadays/seadays-report.template.html',
            controller: seadaysReportController,
            bindings: {
                monthObs: '<'
            }
        });

    seadaysReportController.$inject = ['$state', '$scope', '$http',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil', '$ionicPopover'];

    function seadaysReportController($state, $scope, $http,
                                    $rootScope, authService, stateService, dataService, StringUtil, ResultsUtil, $ionicPopover) {

        let ctrl = this;
        ctrl.loadings = false;

        // Pie chart config
        ctrl.chartConfig = {
            type: 'pie',
            data: {
                datasets: [{
                    backgroundColor: [],
                    label: 'Sea days',
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
                    callbacks:{
                        // title: function(data, chart) {
                        //     console.log('render title', data);
                        //     console.log('render title', chart);
                        //
                        //     return chart.labels[data[0].index];
                        // },
                        // label: function(data, chart){
                        //     console.log('render label', data);
                        //     console.log('render label', data[0]);
                        //     return 'Number: \t' + ctrl.currentMonth.species[data.index].quantity + '\n';
                        // },
                        // afterLabel: function(data, chart){
                        //     console.log('render footer', data);
                        //     return 'Income: R\t' + ctrl.currentMonth.species[data.index].value;
                        // }
                    },

                }
            }
        };

        let ctx = document.getElementById("seadays-chart-area").getContext("2d");
        ctrl.myPie = new Chart(ctx, ctrl.chartConfig);

        ctrl.weeks = [];


        /*============================================================================
                View enter
         ============================================================================*/
        ctrl.$onInit = function () {
            console.log('testing#########################', ctrl);
            ctrl.loading = false;
            ctrl.monthObs.subscribe(m => ctrl.onMonthChange(m));
        };

        ctrl.onMonthChange = function (m) {
            ctrl.currentMonth = m;
            ctrl.currentMonthNoSeadays = ctrl.currentMonth.days.filter(d => d.out === false).length;
            ctrl.currentMonthSeadays = ctrl.currentMonth.days.filter(d => d.out === true).length;
            ctrl.currentMonthCatchdays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === true).length;

            let noCatchDays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === false);

            ctrl.currentMonthNoCatchdays = noCatchDays.length;

            let date = new Date(ctrl.currentMonth.month);
            let month = months[date.getMonth()];
            ctrl.currentMonthNoCatchResons = noCatchDays.map(d => {
                return {
                    day: d.day + ' ' + month,
                    reason: d.reason || 'Geen rede verskaf nie',
                }
            });
            buildChartConfig(ctrl.currentMonth);
            buildCalendarConfig(ctrl.currentMonth);
            ctrl.myPie.update();
        };

        ctrl.getCalendarIcon = function(day) {
            if(!day.out) {
                return "components/reports/anchor.png";
            }

            if(!day.catch) {
                return "components/reports/fish-empty.png"
            }

            return "components/reports/fish-green.png"
        };

        ctrl.getTooltipTemplate= function(day) {
            let date = new Date(ctrl.currentMonth.month);
            let month = months[date.getMonth()];

            let template = "<style>#ttdate { font-weight: bold; display: block; padding: 0; margin: 4px 0; } #tttype { font-weight: normal; display: block; padding: 0; margin: 4px 0 16px 0; } #ttreason { font-weight: normal; display: block; padding: 0; margin: 4px 0; }</style>"
            if(!day.out) {
                template += '<span id="ttdate">'+day.day+' '+month+'</span>'+
                    '<span id="tttype">Nie see dag</span>'+
                    '<span id="ttreason">'+(day.reason || 'Geen rede verskaf nie')+'</span>';
                return template;
            }

            if(!day.catch) {
                template += '<span id="ttdate">'+day.day+' '+month+'</span>'+
                    '<span id="tttype">Geen vangste</span>'+
                    '<span id="ttreason">'+(day.reason || 'Geen rede verskaf nie')+'</span>';
                return template;
            }

            if(day.catch) {
                template += '<span id="ttdate">' + day.day + ' ' + month + '</span>' +
                    '<span id="tttype">Vis gevang</span>' +
                    '<span id="ttreason">' + day.species.join(', ') + '</span>';
                return template;
            }
        };

        ctrl.getTooltipPosition= function(index, day) {
            let pos = new Set();
            pos.add('top');

            switch (index) {
                case 0:
                case 1:
                    pos.add("right");
                    break;
                case 5:
                case 6:
                    pos.add("left");
                    break;
            }

            return Array.from(pos).join(' ');
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
            let labels = ["See dae met vangste", "See dae sonder vangste", "Nie see dae"];
            let datasets = [];
            let colours = pattern.generate(['#9CE159', '#9D45B8', '#E7A13D']);

            let catchdays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === true).length;
            let noCatchdays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === false).length;
            let noSeadays = ctrl.currentMonth.days.filter(d => d.out === false).length;

            datasets.push(catchdays);
            datasets.push(noCatchdays);
            datasets.push(noSeadays);

            ctrl.chartConfig.data.labels = labels;
            ctrl.chartConfig.data.datasets[0].data = datasets;
            ctrl.chartConfig.data.datasets[0].backgroundColor = colours;
            // ctrl.chartConfig.options.tooltips =  {
            //     custom: ctrl.customTooltip,
            // }
        };

        const buildCalendarConfig = function(currentMonth) {
            const weeks = [];
            const month = new Date(currentMonth.month);
            const day = month.getDay();

            const totalWeeks = Math.ceil(currentMonth.days.length/7);
            console.log('tot weeks', totalWeeks);

            for(let i = 0; i < totalWeeks*7; i+=7){
                let week = [];
                if (i === 0) {
                    for(let k = 0; k < day; k++){
                        week.push({day: 0, out: false, catch:false, species:[]});
                    }
                }



                week = week.concat(currentMonth.days.slice(Math.max(i-day, 0), i+7-day));

                while (week.length < 7) {
                    week.push({day: 0, out: false, catch:false, species:[]});
                }
                weeks.push(week);
            }

            console.log('weeks', weeks);
            ctrl.weeks = weeks;
        }
    }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const speciesColorMap = {
        'snoek': '#9AE34F',
        'cape_bream': '#FF7400',
    };

    const speciesImageMap = {
        'snoek': 'components/reports/income/img/snoek_200.png',
        'cape_bream': 'components/reports/income/img/capebream_200.png',
    };

}());
