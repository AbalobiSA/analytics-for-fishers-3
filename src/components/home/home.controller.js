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

/*============================================================================
        View Enter
 ============================================================================*/
        $scope.$on('$ionicView.enter', function() {
            vm.isLoading = true;
            dataService.getRecentCatches((catches) => {
                aggregateCatchesByDate(catches);
                vm.isLoading = false;
                // console.log(JSON.stringify(recentCatches));
            }, (error) => {
                recentCatches = undefined;
                console.log(error);
                vm.isLoading = false;
            })
        });
/*============================================================================
        Functions
 ============================================================================*/

        function getIdentityFromServer() {

        }

        function getViewTitle() {
            // if (isAuthenticated()) {
            //     return vm.getProfile().email;
            // } else {
            //     return "Fisher Analytics";
            // }
            return "Fisher Analytics";
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
            var records = new Object();
            records.speciesInfo = [];

            return tripObs
                .reduce(collectTotal, records)
                .map(summedRecords => {
                    return createRecord(tripObs.key, summedRecords);
                });
        }

        function collectTotal(acc, entry){
            updateLandingSiteIfNecessary(acc, entry);
            var record = {key:entry.species, value:getEntryValue(entry)}
            if(entry.fisher_name){
                record.fisher = StringUtil.capitalise(entry.fisher_name);
            }
            acc.speciesInfo.push(record);
            return acc;
        }

        function updateLandingSiteIfNecessary(acc, entry){
            if((typeof entry.site === 'undefined' || entry.site == null) &&
                (typeof entry.site_back_up === 'undefined' || entry.site_back_up == null)){
                acc.site = StringUtil.capitalise(entry.community);
            } else if (typeof entry.site !== 'undefined' && entry.site != null) {
                acc.site = entry.site.substring(entry.site.indexOf('-')+1);
            } else if (typeof entry.site_back_up !== 'undefined' || entry.site_back_up != null) {
                acc.site = StringUtil.capitalise(entry.site_back_up.substring(0, entry.site_back_up.indexOf('_')));
            }
        }

        function createRecord(key, totals){
            var rec = {key: key};
            rec['speciesInfo'] = totals.speciesInfo;
            rec['site'] = totals.site;
            return rec;
        }

        function getEntryValue(entry){
            if(entry.weight != null){
                return entry.weight+" kg";
            } else if (entry.items != null) {
                return entry.items+" units";
            } else if (entry.crates != null) {
                return entry.crates+" crates";
            } else{
                return "N/A";
            }
        }

    }

}());
