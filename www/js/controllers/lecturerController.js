myApp.controller('lecturerController', ['$scope','$rootScope', '$location', '$ionicPopup', '$ionicLoading', '$http', '$state', '$cordovaCalendar', 'dataService',
    function($scope, $rootScope, $location, $ionicPopup, $ionicLoading, $http, $state, $cordovaCalendar, dataService ) {

        $scope.data = { "lecturers" : [],
            "schedules":[],
            "scheduleTemplate":'',
            "search" : { "template": '', "obj":{}},
            "days": dataService.getDays(),
            "currentDay": dataService.getCurrentDay(),
            "pairs": dataService.getPairs(),
            "recentSchedules": getRecentSchedules('lecturer')};

        $scope.isUnsync = false;

        $scope.mySchedules = getRecentSchedules('my');

        $scope.emptySearch = function(){
            $scope.data.search.template = '';
            $scope.data.obj = {};
            $scope.data.lecturers = [];
        };

        //console.log($scope.data.recentSchedules);

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

        $scope.searchLecturers = function() {

            if(dataService.isCorrectQueryTemplate($scope.data.search.template)) {

                $scope.isLoadingLecturers = true;
                $scope.data.lecturers = [];

                $http.get(prefixAPEX + 'lecturersSearch/' + $scope.data.search.template + '/10', {}).error(function (data, status) {
                    onNetworkError(status);
                }).then(function (response) {
                    $scope.data.lecturers = response.data.items;
                    $scope.isLoadingLecturers = false;
                });
            }else{
                $scope.data.lecturers = [];
                $scope.isLoadingLecturers = false;

            }

        };

        $scope.goToRecentSchedule = function(recentSchedule){
            $scope.data.search.template = recentSchedule.title;
            $scope.data.search.obj = recentSchedule.obj;
            $scope.data.scheduleTemplate = recentSchedule.title;

            if(isOnline() && isAutoSyncGet()){
                //console.log("loading");
                $scope.getSchedulesForLecturer(recentSchedule.obj);
            }else {
                $scope.data.schedules = recentSchedule.schedules;

                if($scope.mySchedules[0] != undefined) {
                    $scope.isMySchedule = $scope.data.scheduleTemplate == $scope.mySchedules[0].title;
                }else{
                    $scope.isMySchedule = false;
                }

                $scope.isUnsync = true;
            }
        };


        $scope.getSchedulesForLecturer = function(lecturer){
            if(dataService.isCorrectQueryTemplate(lecturer.fullnames)) {
                $scope.isLoadingSchedules = true;
                $scope.data.schedules = [];

                $scope.isShow = false;

                $http.get(prefixAPEX + 'agregatedSchedulesForLecturer/' + lecturer.fullnames, {}).error(function (data, status) {
                    onNetworkError(status);
                }).then(function (response) {
                    $scope.data.schedules = response.data.items;

                    //console.log($scope.data.schedules);

                    $scope.data.scheduleTemplate = $scope.data.search.template;
                    $scope.isLoadingSchedules = false;
                    $scope.isUnsync = false;
                    $scope.isShow = true;

                    if($scope.mySchedules[0] != undefined) {
                        $scope.isMySchedule = $scope.data.scheduleTemplate == $scope.mySchedules[0].title;
                    }else{
                        $scope.isMySchedule = false;
                    }

                    addRecentSchedule($scope.data.schedules,'lecturer',$scope.data.scheduleTemplate, $scope.data.search.obj, 'lecturer');

                });
            }else{
                $scope.data.schedules = [];
                $scope.isLoadingSchedules = false;
            }
        };

        $scope.getSchedulesForDay = function (day) {
            return dataService.getSchedulesForDay($scope.data.schedules,day);
        }

        $scope.setLecturer = function(currentLecturer){
            $scope.data.search.obj = currentLecturer;
            $scope.data.search.template = currentLecturer.fullname;
            $scope.data.lecturers = [];
            $scope.data.schedules = [];
            $scope.getSchedulesForLecturer($scope.data.search.obj);
        };


        $scope.isLoadingShow = function(){
            if($scope.isLoadingSchedules || $scope.isLoadingLecturers)
                return true;
            return false;
        };


        $scope.isSearchListShow = function(){

            if($scope.data.lecturers != undefined)
                if($scope.data.lecturers.length > 0)
                    return true;
            return false;

        };

        $scope.isScheduleListShow = function(){
            if($scope.data.schedules != undefined && !$scope.isLoadingShow() && !$scope.isSearchListShow())
                if($scope.data.schedules.length > 0)
                    return true;

            return false;
        };

        $scope.isRecentListShow = function(){
            if($scope.isLoadingShow() || $scope.isSearchListShow() || $scope.isScheduleListShow())
                return false;
            return true;
        };

        $scope.update = function(){
            $scope.getSchedulesForLecturer($scope.data.search.obj);
        }

        $scope.$on("updateButtonPress",function(event, args){
            if($scope.isScheduleListShow())
                $scope.update();
        });

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

        $scope.setAsMySchedule = function(){
            //console.log("open");
            $ionicPopup.show({
                title: 'Сделать основным расписанием ?',
                subTitle: $scope.data.scheduleTemplate,
                scope: $scope,
                buttons: [
                    {text: 'Нет'},
                    {
                        text: '<b>Да</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            addRecentSchedule($scope.data.schedules,'my' ,$scope.data.scheduleTemplate, $scope.data.search.obj, 'lecturer');
                            $state.go('my_schedule');
                        }
                    }
                ]
            });
        };

    }]);
