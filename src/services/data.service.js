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

        // let SERVER_IP = "http://localhost:8080";
        let SERVER_IP = "https://server.abalobi.org";

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

        let catchDaysData;

        let mainUserEmailAddress;
        let mainUserAbalobiId;
        let managedUsers;

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
         * @param refreshData {boolean} Should we refresh the data?
         */
        function getRecentCatches(refreshData) {
            return new Promise((resolve, reject) => {
                let endpoint = "/api/analytics/test";
                let access_token = localStorage.getItem('access_token');

                if (!access_token) {
                    console.log("No access token!");
                    reject("No access token found.");
                } else {
                    let options = {
                        url: SERVER_IP + endpoint,
                        params: {
                            access_token : access_token
                        },
                        method: 'GET'
                    };
                    console.log("Debug: OPTIONS: " + JSON.stringify(options, null, 4));
                    if (refreshData || recentCatches === undefined) {
                        recentCatches = undefined;
                        $http(options)
                            .then(response => {
                                recentCatches = response;
                                resolve(recentCatches);
                            }).catch(error => reject(error));
                    }
                    else {
                        console.log("Sending back cached data.");
                        resolve(recentCatches);
                    }
                }
            });
        }

        function queryCatchByTimePeriod(interval, refreshData) {

            return new Promise ((resolve, reject) => {
                let access_token = localStorage.getItem('access_token');
                let endpoint = "/api/analytics/catches_over_time";
                // console.log("Debug: Querying catches over time: " + interval);
                // console.log("Debug: Access token: " + access_token);

                if (refreshData || handleIntervalObjectSelection(interval)) {
                    console.log("MAKING REQUEST: " + interval);
                    $http({
                        method: 'GET',
                        url: SERVER_IP + endpoint,
                        params: {
                            access_token: access_token,
                            interval: interval
                        }
                    }).then((response) => {
                        // Handle the query interval
                        switch (interval.toLowerCase()) {
                            case "weekly" : catchByTimePeriod_weekly = response;
                                resolve(catchByTimePeriod_weekly);
                                break;
                            case "monthly" : catchByTimePeriod_monthly = response;
                                resolve(catchByTimePeriod_monthly);
                                break;
                            case "yearly" : catchByTimePeriod_yearly = response;
                                resolve(catchByTimePeriod_yearly);
                                break;
                        }
                    }, (error) => {
                        reject(error);
                    });
                }
                else {
                    switch (interval.toLowerCase()) {
                        case "weekly" :
                            resolve(catchByTimePeriod_weekly);
                            break;
                        case "monthly" :
                            resolve(catchByTimePeriod_monthly);
                            break;
                        case "yearly" :
                            resolve(catchByTimePeriod_yearly);
                            break;
                    }
                }
            });
        }

        function queryExpensesIncomeByTimePeriod(interval, refreshData) {
            console.log("DEBUG: Selected interval is " + interval);
            return new Promise((resolve, reject) => {
                let access_token = localStorage.getItem('access_token');
                let endpoint = "/api/analytics/expenses_income";

                if (refreshData || handleIncomeExpense(interval)) {
                    console.log("MAKING REQUEST: " + interval);
                    $http({
                        method: 'GET',
                        url: SERVER_IP + endpoint,
                        params: {
                            'access_token' : access_token,
                            'interval' : interval
                        }
                    }).then((response) => {
                        // Handle the query interval
                        // console.log("DEBUG: SHOWING RESPONSE " + JSON.stringify(response, null, 4));

                        switch (interval.toLowerCase()) {
                            case "weekly" : expensesIncomehByTimePeriod_weekly = (response);
                                resolve(expensesIncomehByTimePeriod_weekly);
                                break;
                            case "monthly" : expensesIncomehByTimePeriod_monthly = (response);
                                resolve(expensesIncomehByTimePeriod_monthly);
                                break;
                            case "yearly" : expensesIncomehByTimePeriod_yearly = (response);
                                resolve(expensesIncomehByTimePeriod_yearly);
                                break;
                            default:
                                reject({error: 'No matching interval'});
                        }
                    }, error => {
                        reject(error);
                    });
                }
                else {
                    switch (interval.toLowerCase()) {
                        case "weekly" : resolve(expensesIncomehByTimePeriod_weekly);
                            break;
                        case "monthly" : resolve(expensesIncomehByTimePeriod_monthly);
                            break;
                        case "yearly" : resolve(expensesIncomehByTimePeriod_yearly);
                            break;
                        default: reject({error: 'No matching interval'});
                    }
                }
            });


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
                    params: {
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

        function queryCatchDays(refreshData) {
            return new Promise((resolve, reject) => {
                let access_token = localStorage.getItem('access_token');
                let endpoint = "/api/analytics/catch_days";
                // console.log("Debug: Querying catches over time: " + interval);
                // console.log("Debug: Access token: " + access_token);

                if (refreshData || catchDaysData === undefined) {
                    catchDaysData = undefined;
                    console.log("MAKING REQUEST: Catch days data");
                    $http({
                        method: 'GET',
                        url: SERVER_IP + endpoint,
                        params: {
                            'access_token' : access_token
                        }
                    }).then((response) => {
                        console.log("DEBUG: Loggin data");
                        console.log(JSON.stringify(response.data));
                        catchDaysData = (response.data);
                        // console.log(JSON.stringify(response.data, null, 4));
                        resolve(catchDaysData);
                    }, (error) => {
                        reject(error);
                    });
                }
                else {
                    resolve(catchDaysData);
                }
            });
        }

        function getEmailAddress(refreshData) {
            return new Promise ((resolve, reject) => {
                let access_token = localStorage.getItem('access_token');
                let endpoint = "/api/analytics/user_email";
                // console.log("Debug: Querying catches over time: " + interval);
                // console.log("Debug: Access token: " + access_token);

                if (refreshData || mainUserEmailAddress === undefined || mainUserAbalobiId === undefined) {
                    console.log("MAKING REQUEST: User Email");
                    $http({
                        method: 'GET',
                        url: SERVER_IP + endpoint,
                        params: {
                            'access_token' : access_token
                        }
                    }).then((response) => {
                        console.log(JSON.stringify(response, null, 4));
                        mainUserEmailAddress = (response.data[0].Email__c);
                        mainUserAbalobiId = response.data[0].abalobi_id__c;
                        resolve([mainUserEmailAddress, mainUserAbalobiId]);
                    }, (error) => {
                        reject(error);
                    });
                }
                else {
                    resolve(mainUserEmailAddress, mainUserAbalobiId);
                }
            });
        }

        function getManagerUsers() {

            console.log("Making request: Managed users");

            let access_token = localStorage.getItem('access_token');
            let endpoint = "/api/analytics/manager_users";

            let options = {
                method: 'GET',
                url: SERVER_IP + endpoint,
                params: {
                    'access_token' : access_token
                }
            };

            return $http(options);
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

        function handleIncomeExpense(interval) {
            switch (interval.toLowerCase()) {
                case "weekly" : return expensesIncomehByTimePeriod_weekly === undefined;
                    break;
                case "monthly" : return expensesIncomehByTimePeriod_monthly === undefined;
                    break;
                case "yearly" : return expensesIncomehByTimePeriod_yearly === undefined;
                    break;
                default: return true;
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
                default: return true;
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
                default: return true;
            }
        }

/*============================================================================
        Utility Functions
 ============================================================================*/

        /**
         * Called when the user is logged out. Resets internal storage variables.
         */
        function clearAll () {
            recentCatches = undefined;

            catchByTimePeriod_yearly = undefined;
            catchByTimePeriod_monthly = undefined;
            catchByTimePeriod_weekly = undefined;

            expensesIncomehByTimePeriod_yearly = undefined;
            expensesIncomehByTimePeriod_monthly = undefined;
            expensesIncomehByTimePeriod_weekly = undefined;

            priceChange_batch = undefined;
            priceChange_items = undefined;
            priceChange_weight = undefined;
            priceChange_crates = undefined;

            catchDaysData = undefined;

            mainUserEmailAddress = undefined;
            mainUserAbalobiId = undefined;
        }

/*============================================================================

 ============================================================================*/

        return {
            clearAll: clearAll,
            getRecentCatches: getRecentCatches,
            queryCatchByTimePeriod: queryCatchByTimePeriod,
            queryExpensesIncomeByTimePeriod: queryExpensesIncomeByTimePeriod,
            queryEvolutionOfPrices: queryEvolutionOfPrices,
            queryCatchDays: queryCatchDays,
            getEmailAddress: getEmailAddress,
            getManagerUsers: getManagerUsers,

            TIME_INTERVALS: TIME_INTERVALS,
            QUANTITY_AGGREGATION_TYPES: QUANTITY_AGGREGATION_TYPES,
            BASE_FISHER_LIST: BASE_FISHER_LIST,
            fisherList: fisherList,
            groupByInterval: groupByInterval,
            userIsManager: userIsManager
        }
    }
})();
