

myApp.controller('mapController', ['$scope','dataService', function($scope, dataService) {

    $scope.mapHeight = screen.height-44 + "px";
    $scope.mapWidth = screen.width + "px";
    $scope.geocodingAddress = geocodingAddress;



    function initialize() {

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': $scope.geocodingAddress, 'region': 'uk'}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                var mapOptions = {
                    center: results[0].geometry.location,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var map = new google.maps.Map(document.getElementById("map"),
                    mapOptions);

                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });

                google.maps.event.addListenerOnce(map, 'idle', function () {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(results[0].geometry.location);
                });

            } else {
                //console.log(status);
            }
        });
    }

    //TODO: change this
    ionic.Platform.ready(initialize);
}]);
