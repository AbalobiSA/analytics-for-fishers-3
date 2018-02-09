/**
 * Created by Carl on 2017-06-08.
 */
angular.module('app')
    .controller('SidemenuCtrl', function ($scope, authService, $ionicSideMenuDelegate, $ionicPopover) {
    // $scope.refreshing = false;
    $scope.logout = function () {
        $ionicSideMenuDelegate.toggleLeft();
        console.log("logging out");
        authService.logout();
    };

    $ionicPopover.fromTemplateUrl('components/sidemenu/popover.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
      });

      $scope.clicker = function(){
          console.log("clicked");
      }

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
