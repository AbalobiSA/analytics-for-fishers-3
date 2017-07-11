/**
 * Created by Carl on 2017-06-08.
 */
angular.module('app')
    .controller('SidemenuCtrl', function ($scope, authService, $ionicSideMenuDelegate) {
    // $scope.refreshing = false;
    $scope.logout = function () {
        $ionicSideMenuDelegate.toggleLeft();
        console.log("logging out");
        authService.logout();
    };

    // $scope.refresh = function () {
    //     console.log("refreshing");
    //     // refreshBus.post(true);
    //     $scope.refreshing = true;
    // };
    //
    // refreshBus.observable().filter(function (evt) {
    //     return !evt;
    // }).subscribe(function (evt) {
    //     return $scope.refreshing = false;
    // });
    //
    // refreshBus.observable().filter(function (evt) {
    //     return evt == null;
    // }).subscribe(function (evt) {
    //     return $scope.refresh();
    // });
});
