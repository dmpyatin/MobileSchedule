myApp.controller('auditoriumController', ['$scope','$rootScope', '$location', '$ionicPopup', '$ionicLoading', '$http', '$state', '$cordovaCalendar', 'dataService',
    function($scope, $rootScope, $location, $ionicPopup, $ionicLoading, $http, $state, $cordovaCalendar, dataService ) {


        $scope.data = { "auditoriums" : [],
            "schedules":[],
            "scheduleTemplate":'',
            "search" : { "template": '', "obj":{}},
            "days": dataService.getDays(),
            "currentDay": dataService.getCurrentDay(),
            "pairs": dataService.getPairs(),
            "recentSchedules": getRecentSchedules('auditorium')};

        $scope.isUnsync = false;

        $scope.emptySearch = function(){
            $scope.data.search.template = '';
            $scope.data.obj = {};
            $scope.data.auditoriums = [];
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

        $scope.searchAuditoriums = function() {

            if(dataService.isCorrectQueryTemplate($scope.data.search.template)) {

                $scope.data.auditoriums = [];
                $scope.isLoadingAuditoriums = true;

                $http.get(prefixAPEX + 'auditoriumsSearch/' + $scope.data.search.template + '/10', {}).error(function (data, status) {
                    onNetworkError(status);
                }).then(function (response) {
                    $scope.data.auditoriums = response.data.items;
                    $scope.isLoadingAuditoriums = false;
                });
            }else{
                $scope.data.auditoriums = [];
                $scope.isLoadingAuditoriums = false;
            }
        };

        $scope.goToRecentSchedule = function(recentSchedule){
            $scope.data.search.template = recentSchedule.title;
            $scope.data.search.obj = recentSchedule.obj;
            $scope.data.scheduleTemplate = recentSchedule.title;

            if(isOnline() && isAutoSyncGet()){
               // console.log("loading");
                $scope.getSchedulesForAuditorium(recentSchedule.obj);
            }else {
                $scope.data.schedules = recentSchedule.schedules;

                $scope.isUnsync = true;
            }
        };


        $scope.getSchedulesForAuditorium = function(auditorium){

            if(dataService.isCorrectQueryTemplate(auditorium.num) && dataService.isCorrectQueryTemplate(auditorium.buildingshortname)) {

                $scope.isLoadingSchedules = true;
                $scope.data.schedules = [];

                $http.get(prefixAPEX + 'agregatedSchedulesForAuditorium/' + auditorium.num + '/' + auditorium.buildingshortname, {
                }).error(function (data, status) {
                    onNetworkError(status);
                }).then(function (response) {
                    $scope.data.schedules = response.data.items;
                    $scope.isLoadingSchedules = false;

                    $scope.data.scheduleTemplate = $scope.data.search.template;
                    $scope.isUnsync = false;

                    addRecentSchedule($scope.data.schedules,'auditorium',$scope.data.scheduleTemplate, $scope.data.search.obj, 'auditorium');
                });
            }else{
                $scope.data.schedules = [];
                $scope.isLoadingSchedules = false;

            }
        };

        $scope.getSchedulesForDay = function (day) {
            return dataService.getSchedulesForDay($scope.data.schedules,day);
        }

        $scope.setAuditorium = function(currentAuditorium){
            $scope.data.search.obj = currentAuditorium;
            $scope.data.search.template = currentAuditorium.num + ' ' + currentAuditorium.buildingshortname;
            $scope.data.auditoriums = [];
            $scope.data.schedules = [];
            $scope.getSchedulesForAuditorium($scope.data.search.obj);
        };

        $scope.isLoadingShow = function(){
            if($scope.isLoadingSchedules || $scope.isLoadingAuditoriums)
                return true;
            return false;
        };


        $scope.isSearchListShow = function(){

            if($scope.data.auditoriums != undefined)
                if($scope.data.auditoriums.length > 0)
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
            $scope.getSchedulesForAuditorium($scope.data.search.obj);
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
    }]);
