(function () {

    'use strict';

    angular
        .module('app')
        .component('seadaysReport', {
            templateUrl: 'components/reports/seadays/seadays-report.template.html',
            controller: seadaysReportController,
            bindings: {
                colors: '<',
                monthMap: '<',
                monthObs: '<',
                noTripReasonsList: '<',
                year: '<',
            }
        });

    seadaysReportController.$inject = ['$state', '$scope', '$http', '$filter',
        '$rootScope', 'authService', 'stateService', 'dataService', 'StringUtil', 'ResultsUtil', '$ionicPopover'];

    function seadaysReportController($state, $scope, $http, $filter,
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
                    // shows the tooltip on the pie slice on click
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

        let ctx = document.getElementById("seadays-chart-area").getContext("2d");
        ctrl.myPie = new Chart(ctx, ctrl.chartConfig);

        ctrl.weeks = [];

        let date = new Date();
        let currentYear = date.getUTCFullYear();
        let currentMonth = date.getMonth();
        let currentDay = date.getDate();
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
            ctrl.currentMonth = m;
            console.log(m);
            ctrl.currentMonthNoSeadays = ctrl.currentMonth.days.filter(d => d.out === false).length;
            ctrl.currentMonthSeadays = ctrl.currentMonth.days.filter(d => d.out === true).length;
            ctrl.currentMonthCatchdays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === true).length;
            
            let noCatchDays = ctrl.currentMonth.days.filter(d => d.out === true && d.catch === false);
            ctrl.currentMonthNoCatchdays = noCatchDays.length;

            let month = ctrl.monthMap[ctrl.currentMonth.month];
            ctrl.currentMonthNoCatchResons = noCatchDays.map(d => {
                return {
                    day: d.day + ' ' + month,
                    reason: d.reason || 'Geen rede verskaf nie',
                }
            });
            buildChartConfig(ctrl.currentMonth);
            buildCalendarConfig(ctrl.currentMonth);
            ctrl.myPie.update();
            applyScope();
        };

        ctrl.getCalendarIcon = function(day) {
            if (currentYear == ctrl.year && currentMonth == ctrl.currentMonth.month-1 && day.day > currentDay){
                return "components/reports/blank.png";
            }

            if(!day.out) {
                return "components/reports/anchor.png";
            }

            if(!day.catch) {
                return "components/reports/fish-empty.png"
            }

            return "components/reports/fish-green.png"
        };

        ctrl.getTooltipTemplate= function(day) {
            let month = ctrl.monthMap[ctrl.currentMonth.month];

            let template = "<style>#ttdate { font-weight: bold; display: block; padding: 0; margin: 4px 0; } #tttype { font-weight: normal; display: block; padding: 0; margin: 4px 0 16px 0; } #ttreason { font-weight: normal; display: block; padding: 0; margin: 4px 0; }</style>"
            if(!day.out) {
                let reason;
                (!day.has_record) ? reason = 'Geen voorlegging nie' : reason = $filter('listKeyMapper')(day.reason, ctrl.noTripReasonsList, 'afr') || 'Geen rede verskaf nie';

                template += '<span id="ttdate">'+day.day+' '+month+'</span>'+
                    '<span id="tttype">Nie see dag</span>'+
                    '<span id="ttreason">'+reason+'</span>';
                return template;
            }

            if(!day.catch) {
                template += '<span id="ttdate">'+day.day+' '+month+'</span>'+
                    '<span id="tttype">Geen vangste</span>'+
                    '<span id="ttreason">'+(day.reason || 'Geen rede verskaf nie')+'</span>';
                return template;
            }

            if(day.catch) {
                // let species = day.species.join(', ');
                let species = day.species;
                template += '<span id="ttdate">' + day.day + ' ' + month + '</span>' +
                    '<span id="tttype">Vis gevang</span>' +
                    '<span id="ttreason">' + species + '</span>';
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

        function resetLocalVariables() {}

        const buildChartConfig = function (selectedMonth) {
            let labels = ["See dae met vangste", "See dae sonder vangste", "Nie see dae"];
            let datasets = [];
            let colours = ctrl.colors.slice(3,6);

            let catchdays = selectedMonth.days.filter(d => d.out === true && d.catch === true).length;
            let noCatchdays = selectedMonth.days.filter(d => d.out === true && d.catch === false).length;
            let noSeadays = selectedMonth.days.filter(d => d.out === false).length;

            datasets.push(catchdays);
            datasets.push(noCatchdays);
            datasets.push(noSeadays);

            ctrl.chartConfig.data.labels = labels;
            ctrl.chartConfig.data.datasets[0].data = datasets;
            ctrl.chartConfig.data.datasets[0].backgroundColor = colours;
        };

        const buildCalendarConfig = function(selectedMonth) {
            const weeks = [];
            const month = new Date(ctrl.year, selectedMonth.month-1, 1);
            const day = month.getDay();

            const totalWeeks = Math.ceil(selectedMonth.days.length/7);
            console.log('tot weeks', totalWeeks);

            for(let i = 0; i < totalWeeks*7; i+=7){
                let week = [];
                if (i === 0) {
                    for(let k = 0; k < day; k++){
                        week.push({day: 0, out: false, catch:false, species:[]});
                    }
                }



                week = week.concat(selectedMonth.days.slice(Math.max(i-day, 0), i+7-day));

                while (week.length < 7) {
                    week.push({day: 0, out: false, catch:false, species:[]});
                }
                weeks.push(week);
            }

            console.log('weeks', weeks);
            ctrl.weeks = weeks;
        }

        const showError = function(err) {
            console.log(`Error: ${JSON.stringify(err, null, 4)}`);
            ctrl.loading = false;
            applyScope();
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
