(function () {

    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$scope', '$http',
        '$rootScope','authService', 'stateService', 'dataService', 'StringUtil'];

    function HomeController($state, $scope, $http, $rootScope, authService, stateService, dataService, StringUtil) {

/*============================================================================
        Variable Declarations
 ============================================================================*/

        let vm = this;
        let consoletext = "";
        let recentCatches;
        let responseData;

/*============================================================================
        Function Mappings
 ============================================================================*/

        vm.login = login;
        vm.getProfile = getProfile;
        vm.logout = authService.logout;
        vm.consoletext = getConsoleText;
        vm.getViewTitle = getViewTitle;
        vm.recentCatches = displayRecentCatches;
        vm.isLoading = false;
        vm.isManager = false;

/*============================================================================
        View Enter
 ============================================================================*/
        $scope.$on('$ionicView.enter', function() {
            vm.isLoading = true;
            resetLocalVariables();

            dataService.getRecentCatches(false)
                .then(handleDataSuccess)
                .catch(handleDataError)
        });
/*============================================================================
        Functions
 ============================================================================*/

        vm.refreshData = function() {
            vm.isLoading = true;
            recentCatches = undefined;

            dataService.getRecentCatches(true)
                .then(handleDataSuccess)
                .catch(handleDataError)
        };

        function handleDataSuccess(response) {
            aggregateCatchesByDate(response.data.records);
            vm.isManager = response.data.is_manager;
            console.log("Data returned with success.");
            vm.isLoading = false;
            $scope.$apply();
        }

        function handleDataError(error) {
            recentCatches = undefined;
            console.log(error);
            vm.isLoading = false;
            console.log("No data - failure.");
            // $state.go($state.current, {}, {reload: true});
            $scope.$apply();
        }

        function getViewTitle() {
            return "Recent Trips";
        }

        function login() {
            $state.go("menu.login");
        }

        function getProfile() {
            return JSON.parse(localStorage.getItem('profile'));
        }

        function getProfileString() {
            parseStorage(localStorage.getItem('profile'));
        }

        function parseStorage(input) {
            return JSON.stringify(JSON.parse(input), null, 4);
        }

        function getConsoleText() {
            return consoletext;
        }

        function displayRecentCatches() {
            return recentCatches;
        }

        function resetLocalVariables() {
            recentCatches = undefined;
        }

        vm.stringify = function(input) {
            return JSON.stringify(input, null, 4);
        };

/*============================================================================
        Data Processing
 ============================================================================*/

        // Add Aggregate Code to combine catches on the same trip
        function aggregateCatchesByDate(catches) {
            Rx.Observable.from(catches)
                .groupBy(record => record.date)
                .flatMap(aggregateInfo)
                .toArray()
                .subscribe(data => {
                    recentCatches = data;
                });
        }

        function aggregateInfo(tripObs) {
            let records = new Object();
            records.speciesInfo = [];

            return tripObs
                .reduce(collectTotal, records)
                .map(summedRecords => {
                    return createRecord(tripObs.key, summedRecords);
                });
        }

        function collectTotal(acc, entry){
            updateLandingSiteIfNecessary(acc, entry);
            let record = {key:entry.species, value:getEntryValue(entry)}
            if(entry.fisher_name){
                record.fisher = StringUtil.capitalise(entry.fisher_name);
            }
            acc.speciesInfo.push(record);
            return acc;
        }

        function updateLandingSiteIfNecessary(acc, entry){
            if((typeof entry.site === 'undefined' || entry.site === null) &&
                (typeof entry.site_back_up === 'undefined' || entry.site_back_up === null)){
                acc.site = StringUtil.capitalise(entry.community);
            } else if (typeof entry.site !== 'undefined' && entry.site !== null) {
                acc.site = entry.site.substring(entry.site.indexOf('-')+1);
            } else if (typeof entry.site_back_up !== 'undefined' || entry.site_back_up !== null) {
                acc.site = StringUtil.capitalise(entry.site_back_up.substring(0, entry.site_back_up.indexOf('_')));
            }
        }

        function createRecord(key, totals){
            let rec = {key: key};
            rec['speciesInfo'] = totals.speciesInfo;
            rec['site'] = totals.site;
            return rec;
        }

        function getEntryValue(entry){
            if(entry.weight !== null){
                return entry.weight+" kg";
            } else if (entry.items !== null) {
                return entry.items+" units";
            } else if (entry.crates !== null) {
                return entry.crates+" crates";
            } else{
                return "N/A";
            }
        }

    }

}());
