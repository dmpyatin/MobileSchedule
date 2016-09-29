
//var prefix = 'http://localhost:49372/'; //localhost
//var prefix = 'http://10.174.92.24:49372/'; //local external ip
var prefix = 'http://193.232.254.196:6059/scheduleVkApp/' //remote server
var prefixAPEX = 'https://uis.petrsu.ru/apex/rasp/' //IAIS RESTfull

var testBrowserIsOnline = true;

var geocodingAddress = '';

var maxRecentSchedulesPerPage = 10;

myApp.controller('mainController', ['$scope','$rootScope', '$ionicSideMenuDelegate', function($scope,$rootScope,$ionicSideMenuDelegate) {
    $scope.showMenu = function () {
        $ionicSideMenuDelegate.toggleRight();
    };

    $scope.title = '';

    $scope.updateButtonPress = function(){
        $scope.$broadcast("updateButtonPress");
    }

    $scope.isUpdateShow = function(){
        if(isOnline())
                if(!isAutoSyncGet())
                    return true;
        return false;
    }

}]);

var rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g);
var eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g);

function translit(text, engToRus) {
    var x;
    for (x = 0; x < rus.length; x++) {
        text = text.split(engToRus ? eng[x] : rus[x]).join(engToRus ? rus[x] : eng[x]);
        text = text.split(engToRus ? eng[x].toUpperCase() : rus[x].toUpperCase()).join(engToRus ? rus[x].toUpperCase() : eng[x].toUpperCase());
    }
    return text;
};

function isMobile(){
    if(ionic.Platform.isAndroid() ||
        ionic.Platform.isIOS() ||
        ionic.Platform.isWindowsPhone())
        return true;
    return false;
}

function isOnline() {
    if(isMobile()) {
        var isConnected = false;
        var networkConnection = navigator.connection;
        if (!networkConnection.type) {
            $log.error('networkConnection.type is not defined');
            return false;
        }

        switch (networkConnection.type.toLowerCase()) {
            case 'ethernet':
            case 'wifi':
            case 'cell_2g':
            case 'cell_3g':
            case 'cell_4g':
            case '2g':
            case '3g':
            case '4g':
            case 'cell':
            case 'cellular':
                isConnected = true;
                break;
        }

        return isConnected;
    }else{
        return testBrowserIsOnline;
    }
};

function onNetworkError(code){
        alert("Ошибка сетевого соединения. Код" + code);
};


//work with local storage

function addRecentSchedule(schedules, type, title, obje, subtitle) {

    var date = new Date();

    var obj = {schedules: schedules, type: type, title: title, date: date, obj: obje, subtitle: subtitle};

    var currentRecentSchedules = [];

    //TODO: bugs here
    if(type == 'group') {
        if (window.localStorage['recentGroupSchedules'] != undefined && window.localStorage['recentGroupSchedules'] != null) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentGroupSchedules']);
        }
    }
    if(type == 'lecturer'){
        if (window.localStorage['recentLecturerSchedules'] != undefined && window.localStorage['recentLecturerSchedules'] != null) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentLecturerSchedules']);
        }
    }
    if(type == 'auditorium'){
        if (window.localStorage['recentAuditoriumSchedules'] != undefined && window.localStorage['recentAuditoriumSchedules'] != null) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentAuditoriumSchedules']);
        }
    }

    if(type == 'my'){
        if (window.localStorage['mySchedules'] != undefined && window.localStorage['mySchedules'] != null) {
            currentRecentSchedules = JSON.parse(window.localStorage['mySchedules']);
        }
    }

    currentRecentSchedules.sort(function (a, b) {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });

    if(currentRecentSchedules.length > maxRecentSchedulesPerPage) {
        //console.log("recent limit");
        currentRecentSchedules.pop();
    }

    var add = true;
    for(var i = 0; i < currentRecentSchedules.length; ++i){
        if(currentRecentSchedules[i].title == obj.title){
            currentRecentSchedules[i].schedules = obj.schedules;
            currentRecentSchedules[i].date = obj.date;
            add = false;
        }
    }

    if(add) {
        currentRecentSchedules.push(obj);
    }

    if(type == 'group')
        window.localStorage['recentGroupSchedules'] = JSON.stringify(currentRecentSchedules);

    if(type == 'lecturer')
        window.localStorage['recentLecturerSchedules'] = JSON.stringify(currentRecentSchedules);

    if(type == 'auditorium')
        window.localStorage['recentAuditoriumSchedules'] = JSON.stringify(currentRecentSchedules);

    if(type == 'my')
        window.localStorage['mySchedules'] = JSON.stringify(currentRecentSchedules);
}


function langGet(){

    var res = 'ru';
    if(window.localStorage['lang'] != undefined) {
        res = JSON.parse(window.localStorage['lang'] || '{}');
    }

    return res;
}

function langSet(val){
    window.localStorage['lang'] = JSON.stringify(val);
}

function isAutoSyncGet(){

    var res = false;
    if(window.localStorage['isAutoSync'] != undefined) {
        res = JSON.parse(window.localStorage['isAutoSync'] || '{}');
    }

    return res;
}

function isAutoSyncSet(val){
    window.localStorage['isAutoSync'] = JSON.stringify(val);
}


function getRecentSchedules(type){

    var currentRecentSchedules = [];

    if(type == 'group') {
        if (window.localStorage['recentGroupSchedules'] != undefined) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentGroupSchedules'] || '{}');
        }
    }

    if(type == 'lecturer') {
        if (window.localStorage['recentLecturerSchedules'] != undefined) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentLecturerSchedules'] || '{}');
        }
    }

    if(type == 'auditorium') {
        if (window.localStorage['recentAuditoriumSchedules'] != undefined) {
            currentRecentSchedules = JSON.parse(window.localStorage['recentAuditoriumSchedules'] || '{}');
        }
    }

    if(type == 'my') {
        if (window.localStorage['mySchedules'] != undefined) {
            currentRecentSchedules = JSON.parse(window.localStorage['mySchedules'] || '{}');
        }
    }

    currentRecentSchedules.sort(function (a, b) {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });

    //console.log(currentRecentSchedules);

    return currentRecentSchedules;
}