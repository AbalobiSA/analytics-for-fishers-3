/**
 * Created by Carl on 2017-06-08.
 */
angular.module('app')
    .controller('SidemenuCtrl', function ($scope, authService, $ionicSideMenuDelegate, $ionicPopover, $location, $state, $rootScope) {
        $scope.settings = settings;

        function settings() {
            $scope.popover.hide();
            $location.path('/app/settings')
        }

        function isAuthenticated() {
            return authService.isAuthenticated();
        }

        $ionicPopover.fromTemplateUrl('components/sidemenu/popover.html', {
            scope: $scope,
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.$on('$ionicView.enter', function () {
            $scope.showSettings = !$state.is('menu.settings');
            $scope.isAuthenticated = authService.isAuthenticated();
        });

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                $scope.showSettings = toState.name !== 'menu.settings';
                $scope.isAuthenticated = authService.isAuthenticated();
            })
    });
