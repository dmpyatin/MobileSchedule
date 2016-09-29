myApp.service('dataService', function() {
    var days = [
        {"id": 1, "name": "Понедельник", "short": "Пн", "enname": "Monday"},
        {"id": 2, "name": "Вторник", "short": "Вт", "enname": "Tuesday"},
        {"id": 3, "name": "Среда", "short": "Ср", "enname": "Wednesday"},
        {"id": 4, "name": "Четверг", "short": "Чт", "enname": "Thursday"},
        {"id": 5, "name": "Пятница", "short": "Пт", "enname": "Friday"},
        {"id": 6, "name": "Суббота", "short": "Сб", "enname": "Saturday"},
        {"id": 0, "name": "Воскресенье", "short": "Вс", "enname": "Sunday"}
    ];

    var pairs = [1, 2, 3, 4, 5, 6, 7, 8];

    var currentDateTime = new Date();

    var currentDay = days[currentDateTime.getDay()-1];

    var address = '';


    var schedules = [];
    var auditoriums = [];
    var lecturers = [];
    var groups = [];

    return {
        getDays: function() {
            return days;
        },
        getCurrentDay: function(){
            return currentDay
        },
        getPairs: function(){
            return pairs
        },
        getSchedulesForDay: function(schedules, day){
            return schedules.filter(function (item) {
                return (item.dayofweek == day.id);
            }).sort(function(a,b) { return a.pairnumber - b.pairnumber } );
        },
        isCorrectQueryTemplate: function (template){
            if(template != '' && template != undefined)
                return true;
            return false;
        },

        getSchedules: function(group){
            return schedules;
        },

        searchGroups: function(template){
            return groups;
        },

        searchLecturers: function(template){
            return lecturers;
        },

        searchAuditoriums: function(template){
            return auditoriums;
        }


    };
});

