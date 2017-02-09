var app = angular.module('myApp', ['ngRoute', 'djds4rce.angular-socialshare']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html"
        })
        .when("/:search", {
            templateUrl: "home.html"
        })
        .otherwise({
            templateUrl: "home.html"
        });

    $locationProvider.html5Mode(true).hashPrefix('!');

});

app.run(function ($FB) {
    $FB.init('1748104988834383');
});

app.controller('mainCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.displayed = [];
    $scope.increment = 20;
    $scope.matches = [];
    $scope.queryName = '';
    $scope.queryState = '';
    $scope.queryZip = '';
    $scope.reps = [];
    $scope.sens - [];
    $scope.zips = [];

    $scope.chambers = {
        model: "1",
        availableOptions: [
            { id: "1", name: "Both chambers" },
            { id: "2", name: "House" },
            { id: "3", name: "Senate" }
        ]
    };

    $scope.parties = {
        model: "1",
        availableOptions: [
            { id: "1", name: "All Parties" },
            { id: "2", name: "Democratic" },
            { id: "3", name: "Independent" },
            { id: "4", name: "Republican" }
        ]
    };

    $scope.senateCommittees = {
        model: "1",
        availableOptions: [
            { id: "1", name: "All Senate Committees" },
            { id: "2", name: "Appropriations" },
            { id: "3", name: "Agriculture, Nutrition and Forestry" },
            { id: "4", name: "Armed Services" },
            { id: "5", name: "Banking, Housing, and Urban Affairs" },
            { id: "6", name: "Budget" },
            { id: "7", name: "Commerce, Science, and Transportation" },
            { id: "8", name: "Energy and Natural Resources" },
            { id: "9", name: "Environment and Public Works" },
            { id: "10", name: "Ethics" },
            { id: "11", name: "Finance" },
            { id: "12", name: "Foreign Relations" },
            { id: "13", name: "Health, Education, Labor and Pensions" },
            { id: "14", name: "Homeland Security and Governmental Affairs" },
            { id: "15", name: "Indian Affairs" },
            { id: "16", name: "Intelligence" },
            { id: "17", name: "Judiciary" },
            { id: "18", name: "Rules and Administration" },
            { id: "19", name: "Small Business and Entrepreneurship" },
            { id: "20", name: "Veterans' Affairs" }
        ]
    };

    $scope.more = function () {
        $scope.increment = $scope.increment + 20;
    }

    $scope.toggleFilter = function (item) {
        item.toggle = !item.toggle;
    };

    $scope.update = function () {
        var reps = $scope.reps;
        var sens = $scope.sens;

        if ($scope.chambers.model !== "1") {
            if ($scope.chambers.model === "2") {
                sens = [];
            } else {
                reps = [];
            }
        }

        if ($scope.senateCommittees.model !== "1") {
            reps = [];
            var comm = $scope.senateCommittees.availableOptions.filter(function (item) {
                return item.id === $scope.senateCommittees.model;
            })[0];
            sens = sens.filter(function (sen) {
                return sen.committees.indexOf(comm.name) !== -1;
            });
        }

        if ($scope.parties.model !== "1") {
            var party = $scope.parties.availableOptions.filter(function (item) {
                return item.id === $scope.parties.model;
            })[0];
            sens = sens.filter(function (sen) {
                return sen.party === party.name;
            });
            reps = reps.filter(function (rep) {
                return rep.party === party.name;
            });
        }

        if ($scope.queryZip.length === 5 && $scope.zips[$scope.queryZip]) {
            $scope.matches = findByDistrict(parseDistricts($scope.zips[$scope.queryZip]), reps, sens);
        } else if ($scope.queryName && $scope.queryState) {
            $scope.matches = findByState($scope.queryState, findByName($scope.queryName, reps, sens));
        } else if ($scope.queryName) {
            $scope.matches = findByName($scope.queryName, reps, sens);
        } else if ($scope.queryState) {
            $scope.matches = findByState($scope.queryState, reps, sens);
        } else {
            $scope.matches = reps.concat(sens);
        }

        $scope.displayed = $scope.matches.slice(0, $scope.increment);
    }

    $scope.$watchGroup([
      'increment',
      'queryName',
      'queryState',
      'queryZip',
      'chambers.model',
      'parties.model',
      'senateCommittees.model'
    ], function () {
        $scope.update();
    });

    $http.get('/data/reps.json').then(function (results) {
        // results.data = [];
        $scope.reps = addDates(results.data, 2018);
        $scope.matches = results.data;
        $scope.displayed = results.data.slice(0, $scope.increment);
    });

    $http.get('/data/sens.json').then(function (results) {
        results.data = addDates(results.data);
        $scope.sens = results.data;
        $scope.increment += 1;
    });

    $http.get('/data/zips.json').then(function (results) {
        $scope.zips = results.data;
        $scope.increment += 1;
    });


    function addDates(group, reelectionYear) {
        return group.map(function (item) {
            var d = new Date();
            d.setDate(8);
            d.setMonth(10);
            d.setYear(parseInt(reelectionYear || item.yearReelection));
            item['reelection'] = moment(d).fromNow();
            d.setDate(20);
            d.setMonth(0);
            d.setYear(parseInt(item.yearElected));
            item['elected'] = moment(d).fromNow();
            return item;
        });
    }

    function findByDistrict(districts, reps, sens) {
        var state = districts[0].split(' ')[0];
        return reps.filter(function (item) {
            return districts.indexOf(item.state + ' ' + item.district) !== -1;
        }).concat(sens.filter(function (item) {
            return item.state === state;
        }));
    }

    function findByName(name, reps, sens) {
        return reps.filter(function (item) {
            return item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
        }).concat(sens.filter(function (item) {
            return item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
        }));
    }

    function findByState(state, reps, sens) {
        state = state.replace(' ', '_');
        return reps.filter(function (item) {
            return item.state.indexOf(state.toLowerCase()) !== -1;
        }).concat(sens.filter(function (item) {
            return item.state.toLowerCase().indexOf(state.toLowerCase()) !== -1;
        }));
    }

    function parseDistricts(str) {
        if (str.indexOf(',') !== -1) {
            var state = str.split(' ')[0];
            var nums = str.split(' ')[1].split(',');
            return nums.map(function (num) {
                return state + ' ' + num;
            });
        }
        return [str];
    }

}]);


app.directive('whenScrolled', function () {
    return function (scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function () {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
                scope.$apply(attr.whenScrolled);
        });
    };
});

// app.directive('whenScrolled', function () {
//     return function (scope, elm, attr) {
//         var raw = elm[0];
//         elm.bind('scroll', function () {
//             if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
//                 scope.$apply(attr.whenScrolled);
//         });
//     };
// });
