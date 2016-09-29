// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

function loadGMaps() {

    var script = document.createElement('script');
    script.type = 'text/javascript';

    //TODO: very bad hack
    script.src = 'http://maps.googleapis.com/maps/api/js?libraries=weather,visualization&sensor=false&language=ru&v=3.14' + '&signed_in=true&callback=decodeURI';
    document.body.appendChild(script);

   // alert("map script loaded");

    /*
    console.log(window);



    s = document.getElementById('gmaps');
    s.parentNode.insertBefore(script, s);*/
}


var myApp = angular.module('myApp', ['ionic', 'ngCordova', 'ngSanitize'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

      //window.open = cordova.InAppBrowser.open;

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

      if(isOnline()){
          loadGMaps();
      }

      //is app resumed
      $ionicPlatform.on("resume", function(event) {
        // alert("resume");
      });

      //is network became online
      $ionicPlatform.on("online", function(event) {
          //alert("online");
          loadGMaps();
      });
  });
}).filter('friendlyDate', function() {
        return function (date) {

            return moment(date).locale("ru").format('LLL');
        };
    }).filter('currentDate', function() {
    return function (day) {
        if(day == 0)day = 7;

        /*
         moment.locale('ru', {
         calendar : {
         lastDay : '[Вчера в] LLL',
         sameDay : '[Сегодня в] LLL',
         nextDay : '[Завтра в] LLL',
         lastWeek : '[На пррошлой неделе] dddd [в] LLL',
         nextWeek : 'dddd [в] LLL',
         sameElse : 'LLL'
         }
         });*/

        return moment().startOf('week').add(day,'days').locale("ru").format('D dddd');
    };
});

myApp.config(['$compileProvider','$ionicConfigProvider', function ($compileProvider, $ionicConfigProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
    $ionicConfigProvider.tabs.style("standard");
}]);

myApp.config(function($stateProvider, $urlRouterProvider) {

    /*
    $stateProvider.state('tabs', {
        url: "/tab",
        abstract: true,
        templateUrl: "pages/tabs.html"
    }).state('tabs.my_schedule', {
        url: "/my_schedule",
        views: {
            'my_schedule-tab': {
                templateUrl: "pages/my_schedule.html"
            }
        }
    }).state('tabs.group_schedule', {
        url: "/group_schedule",
        views: {
            'group_schedule-tab': {
                templateUrl: "pages/group_schedule.html"
            }
        }
    }).state('tabs.lecturer_schedule', {
        url: "/lecturer_schedule",
        views: {
            'lecturer_schedule-tab': {
                templateUrl: "pages/lecturer_schedule.html"
            }
        }
    }).state('tabs.home', {
        url: "/home",
        views: {
            'home-tab': {
                templateUrl: "pages/home.html"
            }
        }
    }).state('tabs.mapMy', {
        url: "/mapMy",
        views: {
            'my_schedule-tab': {
                templateUrl: "pages/map.html"
            }
        }
    }).state('tabs.mapGroup', {
        url: "/mapGroup",
        views: {
            'group_schedule-tab': {
                templateUrl: "pages/map.html"
            }
        }
    }).state('tabs.mapLecturer', {
        url: "/mapLecturer",
        views: {
            'lecturer_schedule-tab': {
                templateUrl: "pages/map.html"
            }
        }
    }).state('tabs.mapAuditorium', {
        url: "/mapAuditorium",
        views: {
            'home-tab': {
                templateUrl: "pages/map.html"
            }
        }
    }).state('tabs.auditorium_schedule', {
        url: "/auditorium_schedule",
        views: {
            'home-tab': {
                templateUrl: "pages/auditorium_schedule.html"
            }
        }
    }).state('tabs.free_auditoriums', {
        url: "/free_auditoriums",
        views: {
            'home-tab': {
                templateUrl: "pages/free_auditoriums.html"
            }
        }
    }).state('tabs.settings_home', {
        url: "/settings_home",
        views: {
            'home-tab': {
                templateUrl: "pages/settings_home.html"
            }
        }
    }).state('tabs.about', {
        url: "/about",
        views: {
            'home-tab': {
                templateUrl: "pages/about.html"
            }
        }
    });


    $urlRouterProvider.otherwise('/tab/my_schedule');*/

    $stateProvider.state('home', {
        cache: false,
        url: '/home',
        templateUrl: 'pages/home.html'
    });

    $stateProvider.state('group_schedule', {
        url: '/group_schedule',
        templateUrl: 'pages/group_schedule.html'

    });

    $stateProvider.state('lecturer_schedule', {
        url: '/lecturer_schedule',
        templateUrl: 'pages/lecturer_schedule.html'
    });

    $stateProvider.state('auditorium_schedule', {
        url: '/auditorium_schedule',
        templateUrl: 'pages/auditorium_schedule.html'
    });

    $stateProvider.state('my_schedule', {
        cache: false,
        url: '/my_schedule',
        templateUrl: 'pages/my_schedule.html'
    });

    $stateProvider.state('free_auditoriums', {
        url: '/free_auditoriums',
        templateUrl: 'pages/free_auditoriums.html'
    });

    $stateProvider.state('settings_home', {
        url: '/settings_home',
        templateUrl: 'pages/settings_home.html'
    });

    $stateProvider.state('about', {
        url: '/about',
        templateUrl: 'pages/about.html'
    });

    $stateProvider.state('map', {
        cache: false,
        url: '/map',
        templateUrl: 'pages/map.html'
    });

    $urlRouterProvider.otherwise('/my_schedule');
})

window.ionic.Platform.ready(function() {
    angular.bootstrap(document, ['myApp']);
});
