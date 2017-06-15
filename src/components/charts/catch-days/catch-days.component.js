(function() {
    "use strict";

    let catchDaysController = function CatchDaysController(sfdata, refreshBus){
        let ctrl = this;
        ctrl.loading = false;
        // ctrl.dataMap;
        ctrl.xTitle = "Month";
        ctrl.yTitle = "Days";
        let responseObs;

        ctrl.$onInit = function() {
            refreshBus.observable()
                .filter(evt => evt)
                .subscribe(evt => requestData());
            refreshBus.post(null);
        };

        function requestData() {
            ctrl.loading = true;
            sfdata.queryCatchDays()
                    .then(handlerResponse, showError);
        }

        const handlerResponse = function(result){
            console.log("##handling ##CD response");
            console.log(result);
            responseObs = result;
            refreshBus.post(false);
            ctrl.loading = false;
            updateData()
        };

        const showError = function(err) {
            console.log("error");
            ctrl.loading = false;
            refreshBus.post(false);
        };

        const updateData = function () {
            let interval = "monthly";
            responseObs.flatMap(records => Rx.Observable.from(records))
                .map(rec => {return {
                    key: rec.date,
                    fishing: rec.fishing_days,
                    not_fishing: rec.non_fishing_days
                }})
                .toArray()
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = "Month";
                    ctrl.yTitle = "Days";
                    console.log("###catch days data");
                    console.log(data);
                });
        }
    };

    angular.module("app")
        .component("catchDays",{
            templateUrl: 'components/charts/catch-days/catch-days.template.html',
            controller: catchDaysController,
        });
})();
