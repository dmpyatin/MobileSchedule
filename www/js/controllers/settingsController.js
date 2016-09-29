myApp.controller('settingsController', ['$scope','dataService', function($scope, dataService) {

    $scope.data = {isAutoSync: isAutoSyncGet()};


    $scope.$watch("data.isAutoSync", function(newValue, oldValue){
        $scope.update = newValue;
        isAutoSyncSet(newValue);
    });

}]);
