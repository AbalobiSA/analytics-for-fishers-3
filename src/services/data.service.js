/**
 * Created by Carl on 2017-06-06.
 */
(function () {

    'use strict';

    angular
        .module('app')
        .service('dataService', dataService);

    dataService.$inject = ['$rootScope', '$http', 'angularAuth0',
        'authManager', 'jwtHelper', '$location', '$ionicPopup', 'stateService'];

    function dataService($rootScope, $http, angularAuth0,
                         authManager, jwtHelper, $location, $ionicPopup, stateService) {

/*============================================================================
        Variable declarations
 ============================================================================*/

        let SERVER_IP = "http://localhost:8080";
        // let SERVER_IP = "http://197.85.186.65:8080";

        let recentCatches;

        let catchByTimePeriod_yearly;
        let catchByTimePeriod_monthly;
        let catchByTimePeriod_weekly;

        let expensesIncomehByTimePeriod_yearly;
        let expensesIncomehByTimePeriod_monthly;
        let expensesIncomehByTimePeriod_weekly;

        let priceChange_batch;
        let priceChange_items;
        let priceChange_weight;
        let priceChange_crates;

        const TIME_INTERVALS = ["Yearly", "Monthly", "Weekly"];
        const QUANTITY_AGGREGATION_TYPES = ["Items", "Weight", "Crates"];

        const BASE_FISHER_LIST = [{
            lkup_main_fisher_id__c:"All",
            lkup_main_fisher_id__r: {
                Name: "All"
            }
        }];

        let fisherList = null;
        let userIsManager;

/*============================================================================
        Data Functions
 ============================================================================*/

        /**
         * Get the catches from the last 10 trips.
         * @param successCB
         * @param errorCB
         * @param refreshData {boolean} Should we refresh the data?
         */
        function getRecentCatches(successCB, errorCB, refreshData) {
            let endpoint = "/api/analytics/test";
            let access_token = localStorage.getItem('access_token');
            console.log("Debug: TOKEN: " + access_token);

            if (refreshData || recentCatches === undefined) {
                $http({
                    method: 'GET',
                    url: SERVER_IP + endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'access_token' : access_token
                    }
                }).then((response) => {
                    recentCatches = response.data.records;
                    successCB(recentCatches);
                }, (error) => {
                    errorCB(error);
                });
            }
            else {
                successCB(recentCatches);
            }
        }

        function queryCatchByTimePeriod(interval, successCB, errorCB, refreshData) {
            let access_token = localStorage.getItem('access_token');
            let endpoint = "/api/analytics/catches_over_time";
            // console.log("Debug: Querying catches over time: " + interval);
            // console.log("Debug: Access token: " + access_token);

            if (refreshData || handleIntervalObjectSelection(interval)) {
                console.log("MAKING REQUEEST: " + interval);
                $http({
                    method: 'GET',
                    url: SERVER_IP + endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'access_token' : access_token,
                        'interval' : interval
                    }
                }).then((response) => {
                    // Handle the query interval
                    switch (interval.toLowerCase()) {
                        case "weekly" : catchByTimePeriod_weekly = Rx.Observable
                                        .from(response.data.records);
                                        successCB(catchByTimePeriod_weekly);
                                        break;
                        case "monthly" : catchByTimePeriod_monthly = Rx.Observable
                            .from(response.data.records);
                                        successCB(catchByTimePeriod_monthly);
                                        break;
                        case "yearly" : catchByTimePeriod_yearly = Rx.Observable
                            .from(response.data.records);
                                        successCB(catchByTimePeriod_yearly);
                                        break;
                    }
                }, (error) => {
                    errorCB(error);
                });
            }
            else {
                switch (interval.toLowerCase()) {
                    case "weekly" : successCB(catchByTimePeriod_weekly);
                        break;
                    case "monthly" : successCB(catchByTimePeriod_monthly);
                        break;
                    case "yearly" : successCB(catchByTimePeriod_yearly);
                        break;
                }
            }
        }

        function queryExpensesIncomeByTimePeriod(interval, successCB, errorCB, refreshData) {
            let access_token = localStorage.getItem('access_token');
            let endpoint = "/api/analytics/expenses_income";
            // console.log("Debug: Querying catches over time: " + interval);
            // console.log("Debug: Access token: " + access_token);

            // let expensesIncomehByTimePeriod_yearly;
            // let expensesIncomehByTimePeriod_monthly;
            // let expensesIncomehByTimePeriod_weekly;

            if (refreshData || handleIntervalObjectSelection(interval)) {
                console.log("MAKING REQUEST: " + interval);
                $http({
                    method: 'GET',
                    url: SERVER_IP + endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'access_token' : access_token,
                        'interval' : interval
                    }
                }).then((response) => {
                    // Handle the query interval
                    // console.log("DEBUG: SHOWING RESPONSE " + JSON.stringify(response, null, 4));
                    switch (interval.toLowerCase()) {
                        case "weekly" : expensesIncomehByTimePeriod_weekly = (response.data);
                            successCB(expensesIncomehByTimePeriod_weekly);
                            break;
                        case "monthly" : expensesIncomehByTimePeriod_monthly = (response.data);
                            successCB(expensesIncomehByTimePeriod_monthly);
                            break;
                        case "yearly" : expensesIncomehByTimePeriod_yearly = (response.data);
                            successCB(expensesIncomehByTimePeriod_yearly);
                            break;
                    }
                }, (error) => {
                    errorCB(error);
                });
            }
            else {
                switch (interval.toLowerCase()) {
                    case "weekly" : successCB(expensesIncomehByTimePeriod_weekly);
                        break;
                    case "monthly" : successCB(expensesIncomehByTimePeriod_monthly);
                        break;
                    case "yearly" : successCB(expensesIncomehByTimePeriod_yearly);
                        break;
                }
            }
        }

        function queryEvolutionOfPrices(interval, successCB, errorCB, refreshData) {
            let access_token = localStorage.getItem('access_token');
            let endpoint = "/api/analytics/expenses_income";
            // console.log("Debug: Querying catches over time: " + interval);
            // console.log("Debug: Access token: " + access_token);

            // let expensesIncomehByTimePeriod_yearly;
            // let expensesIncomehByTimePeriod_monthly;
            // let expensesIncomehByTimePeriod_weekly;

            if (refreshData || handlePriceChangeObject(interval)) {
                console.log("MAKING REQUEST: " + interval);
                $http({
                    method: 'GET',
                    url: SERVER_IP + '/api/analytics/price_evolution',
                    headers: {
                        'Content-Type': 'application/json',
                        'access_token' : access_token,
                        'interval' : interval
                    }
                }).then((response) => {
                    // Handle the query interval
                    // console.log("DEBUG: SHOWING RESPONSE " + JSON.stringify(response, null, 4));
                    switch (interval.toLowerCase()) {
                        case "batch" :
                            priceChange_batch = Rx.Observable.from(response.data);
                            successCB(priceChange_batch);
                            break;
                        case "items" :
                            priceChange_items = Rx.Observable.from(response.data);
                            successCB(priceChange_items);
                            break;
                        case "weight" :
                            priceChange_weight = Rx.Observable.from(response.data);
                            successCB(priceChange_weight);
                            break;
                        case "crates" :
                            priceChange_crates = Rx.Observable.from(response.data);
                            successCB(priceChange_crates);
                            break;
                    }
                }, (error) => {
                    errorCB(error);
                });
            }
            else {
                switch (interval.toLowerCase()) {
                    case "batch" :
                        successCB(priceChange_batch);
                        break;
                    case "items" :
                        successCB(priceChange_items);
                        break;
                    case "weight" :
                        successCB(priceChange_weight);
                        break;
                    case "crates" :
                        successCB(priceChange_crates);
                        break;
                }
            }
        }

/*============================================================================
        Aggregating Functions
 ============================================================================*/

        function groupByInterval(method, record) {
            switch (method.toLowerCase()) {
                case "yearly":
                    return record.year;
                case "monthly":
                    return record.year+"-"+record.month;
                case "weekly":
                    return record.year+"-w"+record.week;
                default: break;

            }
        }

        function handleIntervalObjectSelection (interval) {
            switch (interval.toLowerCase()) {
                case "weekly" : return catchByTimePeriod_weekly === undefined;
                                break;
                case "monthly" : return catchByTimePeriod_monthly === undefined;
                                break;
                case "yearly" : return catchByTimePeriod_yearly === undefined;
                                break;
            }
        }

        function handlePriceChangeObject (interval) {
            switch (interval.toLowerCase()) {
                case "batch" : return priceChange_batch === undefined;
                                break;
                case "items" : return priceChange_items === undefined;
                                break;
                case "weight" : return priceChange_weight === undefined;
                                break;
                case "crates" : return priceChange_crates === undefined;
                                break;
            }
        }

/*============================================================================
        Utility Functions
 ============================================================================*/

        function clearAll () {
            recentCatches = undefined;
        }

/*============================================================================

 ============================================================================*/

        return {
            getRecentCatches: getRecentCatches,
            queryCatchByTimePeriod: queryCatchByTimePeriod,
            clearAll: clearAll,
            queryExpensesIncomeByTimePeriod: queryExpensesIncomeByTimePeriod,
            queryEvolutionOfPrices: queryEvolutionOfPrices,

            TIME_INTERVALS: TIME_INTERVALS,
            QUANTITY_AGGREGATION_TYPES: QUANTITY_AGGREGATION_TYPES,
            BASE_FISHER_LIST: BASE_FISHER_LIST,
            fisherList: fisherList,
            groupByInterval: groupByInterval,
            userIsManager: userIsManager
        }
    }
})();
