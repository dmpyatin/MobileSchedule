myApp.controller('myController', ['$scope','$rootScope', '$window', '$location', '$ionicPopup', '$ionicLoading', '$http', '$state','$cordovaCalendar', 'dataService',
    function($scope, $rootScope, $window, $location, $ionicPopup, $ionicLoading, $http, $state, $cordovaCalendar, dataService ) {

        $scope.data = {
            "days": dataService.getDays(),
            "currentDay": dataService.getCurrentDay(),
            "pairs": dataService.getPairs()};

        /*
         $scope.isScheduled = function() {
         $cordovaLocalNotification.isScheduled("1234").then(function(isScheduled) {
         alert("Notification 1234 Scheduled: " + isScheduled);
         });
         }*/




        $scope.addScheduleToCalendar = function(s){

            $ionicPopup.show({
                title: 'Добавить в календарь ?',
                subTitle: s.weektypename + ' ' + s.tutorialname,
                //templateUrl: 'pages/popups/map_open.html',
                scope: $scope,
                buttons: [
                    {text: 'Нет'},
                    {
                        text: '<b>Да</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            var addDay = s.dayofweek;
                            if(addDay == 7)addDay = 0;
                            var sMoment = moment().startOf('week').add(addDay,'days');


                            var tStart = moment(s.starttime, 'HH:mm');
                            var tEnd = moment(s.endtime, 'HH:mm');

                            var event = {
                                title: s.weektypename + ' ' + s.tutorialname,
                                location: s.auditoriumnumber + ' ' + s.buildingname,
                                notes: s.fullname,
                                startDate: new Date(sMoment.get('year'), sMoment.get('month'), sMoment.get('date'), tStart.get('hour'), tStart.get('minute'), 0, 0, 0),
                                endDate: new Date(sMoment.get('year'), sMoment.get('month'), sMoment.get('date'), tEnd.get('hour'), tEnd.get('minute'), 0, 0, 0)
                            };

                            $cordovaCalendar.createEvent(event).then(function (result) {
                            }, function (err) {
                                alert("Ошибка при добавлении: " + err);
                            });
                        }
                    }
                ]
            });
        }


        /*
        $scope.addSchedulesToCalendar = function(){

            for(var i = 0; i < $scope.mySchedules[0].schedules.length; ++i) {
                var s = $scope.mySchedules[0].schedules[i];

                var addDay = s.dayofweek;
                if(addDay == 7)addDay = 0;
                var sMoment = moment().startOf('week').add(addDay,'days');


                var tStart = moment(s.starttime, 'HH:mm');
                var tEnd = moment(s.endtime, 'HH:mm');

                var event = {
                    title: s.weektypename + ' ' + s.tutorialname,
                    location: s.auditoriumnumber + ' ' + s.buildingname,
                    notes: s.fullname,
                    startDate: new Date(sMoment.get('year'), sMoment.get('month'), sMoment.get('date'), tStart.get('hour'), tStart.get('minute'), 0, 0, 0),
                    endDate: new Date(sMoment.get('year'), sMoment.get('month'), sMoment.get('date'), tEnd.get('hour'), tEnd.get('minute'), 0, 0, 0)
                };


                if(i !=  $scope.mySchedules[0].schedules.length-1) {
                    $cordovaCalendar.createEvent(event).then(function (result) {
                    }, function (err) {
                        alert("Ошибка при добавлении: " + err);
                    });
                }else{
                    $cordovaCalendar.createEvent(event).then(function (result) {
                        alert("Расписание успешно добавлено в календарь");
                    }, function (err) {
                        alert("Ошибка при добавлении: " + err);
                    });
                }

            }
        };


        $scope.copyToCalendar = function(){

            $cordovaCalendar.listCalendars().then(function (result) {
                alert(JSON.stringify(result));

                var myScheduleCalendar = result.filter(function(v) {
                    return v.id == 1;
                });

                if(myScheduleCalendar.length > 0) {
                    $scope.addSchedulesToCalendar();
                }else{
                    alert("Локальный календарь отключен");
                }
            }, function (err) {
                alert("Ошибка при получении списка календарей");
            });
        }*/



        $scope.mySchedules = getRecentSchedules('my');



        $scope.getSchedulesForLecturer = function(lecturer){
            //console.log("lecturer");
            //console.log(lecturer);
            $scope.isLoadingSchedules = true;
            $http.get(prefixAPEX + 'agregatedSchedulesForLecturer/' + lecturer.fullnames, {}).error(function (data, status) {
                onNetworkError(status);
            }).then(function (response) {
                $scope.isLoadingSchedules = false;
                $scope.mySchedules[0].schedules = response.data.items;
                addRecentSchedule( $scope.mySchedules[0].schedules,'my', $scope.mySchedules[0].title, $scope.mySchedules[0].obj, 'lecturer');
            });

        };

        $scope.getSchedulesForGroup = function(group){
            $scope.isLoadingSchedules = true;
            $http.get(prefixAPEX + 'schedulesForGroup/' + group.code + '/' + group.specialitycode, {
            }).error(function (data, status) {
                onNetworkError(status);
            }).then(function (response) {
                $scope.isLoadingSchedules = false;
                $scope.mySchedules[0].schedules = response.data.items;
                //console.log(response.data.items);
                addRecentSchedule( $scope.mySchedules[0].schedules,'my', $scope.mySchedules[0].title, $scope.mySchedules[0].obj, 'group');
            });
        };


        if($scope.mySchedules != undefined) {
            if ($scope.mySchedules.length > 0) {


                if (!isOnline() || !isAutoSyncGet()) {
                    $scope.isUnsync = true;

                } else {
                    $scope.isUnsync = false;
                    //console.log($scope.mySchedules[0]);
                    if ($scope.mySchedules[0].subtitle == 'group') {
                        $scope.getSchedulesForGroup($scope.mySchedules[0].obj);
                    }

                    if ($scope.mySchedules[0].subtitle == 'lecturer') {
                        $scope.getSchedulesForLecturer($scope.mySchedules[0].obj);
                    }
                }
            }
        }


        $scope.isLoadingShow = function(){
            return $scope.isLoadingSchedules;
        };

        $scope.isScheduleListShow = function(){
            if($scope.isLoadingShow())
                return false;

            if($scope.mySchedules != undefined) {
                if ($scope.mySchedules.length > 0)
                    return true;
            }

            return false;
        };



        $scope.update = function(){
            $scope.isUnsync = false;
            if ($scope.mySchedules[0].subtitle == 'group') {
                $scope.getSchedulesForGroup($scope.mySchedules[0].obj);
            }
            if ($scope.mySchedules[0].subtitle == 'lecturer') {
                $scope.getSchedulesForLecturer($scope.mySchedules[0].obj);
            }
        }

        $scope.$on("updateButtonPress",function(event, args){
            if($scope.isScheduleListShow())
                $scope.update();
        });


        $scope.isEmptyNoteShow = function(){
            if($scope.isLoadingShow())
                return false;

            if($scope.mySchedules == undefined)
                return true;

            if($scope.mySchedules.length == 0){
                return true;
            }

            return false;
        }

        $scope.getSchedulesForDay = function (day) {
            if($scope.mySchedules[0] != undefined)
                return dataService.getSchedulesForDay($scope.mySchedules[0].schedules,day);
        };

        $scope.showMapPopup = function(address) {
            if(isOnline()) {
                $ionicPopup.show({
                    title: 'Открыть карту ?',
                    subTitle: address,
                    scope: $scope,
                    buttons: [
                        {text: 'Нет'},
                        {
                            text: '<b>Да</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                geocodingAddress = address;
                                $state.go('map');
                            }
                        }
                    ]
                });
            }else{
                $ionicPopup.show({
                    title: 'Для просмотра карты подключите интернет',
                    scope: $scope,
                    buttons: [
                        {
                            text: '<b>Продолжить</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                            }
                        }
                    ]
                });
            }
        };

    }]);