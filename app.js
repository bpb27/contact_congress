var app = angular.module('myApp', ['ngRoute', 'ngAnimate']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html"
        })
        .when("/about", {
            templateUrl: "about.html"
        })
        .when("/:zip", {
            templateUrl: "home.html"
        })
        .when("/:filters/:state/:name", {
            templateUrl: "home.html"
        })
        .otherwise({
            templateUrl: "home.html"
        });

    $locationProvider.html5Mode(true).hashPrefix('!');

});

app.controller('mainCtrl', ['$scope', '$http', '$routeParams', '$window', function ($scope, $http, $routeParams, $window) {

    $scope.displayed = [];
    $scope.increment = 20;
    $scope.matches = [];
    $scope.queryName = '';
    $scope.queryState = '';
    $scope.queryZip = '';
    $scope.reps = [];
    $scope.sens - [];
    $scope.showOffices = true;
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

    $scope.houseCommittees = {
        model: "1",
        availableOptions: [
            { id: "1", name: "All House Committees" },
            { id: "2", name: "Agriculture" },
            { id: "3", name: "Appropriations" },
            { id: "4", name: "Armed Services" },
            { id: "5", name: "Budget" },
            { id: "6", name: "Education and the Workforce" },
            { id: "7", name: "Energy and Commerce" },
            { id: "8", name: "Ethics" },
            { id: "9", name: "Financial Services" },
            { id: "10", name: "Foreign Affairs" },
            { id: "11", name: "Homeland Security" },
            { id: "12", name: "House Administration" },
            { id: "13", name: "Intelligence" },
            { id: "14", name: "Judiciary" },
            { id: "15", name: "Natural Resources" },
            { id: "16", name: "Oversight and Government Reform" },
            { id: "17", name: "Rules" },
            { id: "18", name: "Science, Space, and Technology" },
            { id: "19", name: "Small Business" },
            { id: "20", name: "Transportation and Infrastructure" },
            { id: "21", name: "Veterans’ Affairs" },
            { id: "22", name: "Ways and Means" }
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

    $scope.sorting = {
        model: "1",
        availableOptions: [
            { id: "1", name: "Order: State (asc)" },
            { id: "2", name: "Order: State (desc)" },
            { id: "3", name: "Order: First name (asc)" },
            { id: "4", name: "Order: First name (desc)" },
            { id: "5", name: "Order: Last name (asc)" },
            { id: "6", name: "Order: Last name (desc)" },
            { id: "7", name: "Order: Year first elected (asc)" },
            { id: "8", name: "Order: Year first elected (desc)" },
            { id: "9", name: "Order: Reelection year (asc)" },
            { id: "10", name: "Order: Reelection year (desc)" },
            { id: "11", name: "Order: Elected by % (asc)" },
            { id: "12", name: "Order: Elected by % (desc)" },
            { id: "13", name: "Order: Trump vote % (asc)" },
            { id: "14", name: "Order: Trump vote % (desc)" },
            { id: "15", name: "Order: Clinton vote % (asc)" },
            { id: "16", name: "Order: Clinton vote % (desc)" },
            { id: "17", name: "Order: ACA enrollees % (asc)" },
            { id: "18", name: "Order: ACA enrollees % (desc)" }
        ]
    };

    $scope.chooseCommittee = function (committee, member) {
        if (member.district) {
            var choice = $scope.houseCommittees.availableOptions.filter(function (c) {
                return c.name === committee;
            })[0].id;
            $scope.houseCommittees.model = $scope.houseCommittees.model === choice ? "1" : choice;
        } else {
            var choice = $scope.senateCommittees.availableOptions.filter(function (c) {
                return c.name === committee;
            })[0].id;
            $scope.senateCommittees.model = $scope.senateCommittees.model === choice ? "1" : choice;
        }
    }

    $scope.generateLink = function () {
        var base = "http://www.contactingcongress.org/";
        var message = 'Copy text below (PC: ctrl + c) (Mac: cmd + c)';
        if ($scope.queryZip.length === 5 && $scope.zips[$scope.queryZip]) {
            prompt(message, base + $scope.queryZip);
        } else {
            var nums = [$scope.chambers.model, $scope.parties.model, $scope.houseCommittees.model, $scope.senateCommittees.model, $scope.sorting.model].join('-');
            var link = base + [nums, $scope.queryState || 'n', $scope.queryName || 'n'].join('/');
            if (link === 'http://www.contactingcongress.org/1-1-1-1-1/n/n') {
                prompt(message, 'http://www.contactingcongress.org/');
            } else {
                prompt(message, link);
            }
        }
    }

    $scope.more = function () {
        $scope.increment = $scope.increment + 20;
        $scope.update(true);
    }

    $scope.toggleFilter = function (item) {
        item.toggle = !item.toggle;
    };

    $scope.toggleShowOffices = function () {
        $scope.showOffices = !$scope.showOffices;
    };

    $scope.update = function (noReset) {

        if (!noReset) {
            $scope.increment = 20;
        }

        var reps = $scope.reps ? $scope.reps.slice() : [];
        var sens = $scope.sens ? $scope.sens.slice() : [];

        if ($scope.chambers.model !== "1") {
            if ($scope.chambers.model === "2") {
                sens = [];
            } else {
                reps = [];
            }
        }

        if ($scope.houseCommittees.model !== "1") {
            sens = [];
            var comm = $scope.houseCommittees.availableOptions.filter(function (item) {
                return item.id === $scope.houseCommittees.model;
            })[0];
            reps = reps.filter(function (rep) {
                return rep.committees.indexOf(comm.name) !== -1;
            });
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

        var sortId = $scope.sorting.model;
        var reverse = $scope.sorting.availableOptions.filter(function (item) {
            return item.id === sortId;
        })[0].name.indexOf('desc') !== -1;

        if (sortId !== "1" && sortId !== "2") {
            var sortId = $scope.sorting.model;
            var sortedMatches = $scope.matches.sort(function (a, b) {
                if (sortId === "3" || sortId === "4") {
                    if (a.name.split(' ')[0].toLowerCase().trim() < b.name.split(' ')[0].toLowerCase().trim()) {
                        return -1;
                    } else if (a.name.split(' ')[0].toLowerCase().trim() > b.name.split(' ')[0].toLowerCase().trim()) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
                if (sortId === "5" || sortId === "6") {
                    if (lastName(a.name) < lastName(b.name)) {
                        return -1;
                    } else if (lastName(a.name) > lastName(b.name)) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
                if (sortId === "7" || sortId === "8") {
                    if (parseInt(a.yearElected.replace('*', '')) < parseInt(b.yearElected.replace('*', ''))) {
                        return -1;
                    } else if (parseInt(a.yearElected.replace('*', '')) > parseInt(b.yearElected.replace('*', ''))) {
                        return 1;
                    } else {
                        return 0
                    }
                }
                if (sortId === "9" || sortId === "10") {
                    if (parseInt(a.yearReelection.replace('*', '')) < parseInt(b.yearReelection.replace('*', ''))) {
                        return -1;
                    } else if (parseInt(a.yearReelection.replace('*', '')) > parseInt(b.yearReelection.replace('*', ''))) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
                if (["11", "12", "13", "14", "15", "16", "17", "18"].indexOf(sortId) !== -1) {
                    var prop = 'votePersonal';

                    if (sortId === '13' || sortId === '14') {
                        prop = 'voteTrump';
                    }
                    if (sortId === '15' || sortId === '16') {
                        prop = 'voteClinton';
                    }
                    if (sortId === '17' || sortId === '18') {
                        prop = 'numbersAca';
                    }

                    if (parseInt(a[prop]) < parseInt(b[prop])) {
                        return -1;
                    } else if (parseInt(a[prop]) > parseInt(b[prop])) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

            $scope.displayed = reverse ? sortedMatches.reverse().slice(0, $scope.increment) : sortedMatches.slice(0, $scope.increment);

        } else {
            $scope.displayed = reverse ? $scope.matches.reverse().slice(0, $scope.increment) : $scope.matches.slice(0, $scope.increment);
        }

    }

    $scope.$watchGroup([
      'queryName',
      'queryState',
      'queryZip',
      'chambers.model',
      'parties.model',
      'houseCommittees.model',
      'senateCommittees.model',
      'sorting.model'
    ], function () {
        $scope.update();
    });

    $http.get('/data/reps.json').then(function (results) {
        $scope.reps = addDates(results.data, 2018);
        $scope.matches = $scope.matches.concat($scope.reps);
        $scope.update();
    });

    $http.get('/data/sens.json').then(function (results) {
        $scope.sens = addDates(results.data);
        $scope.matches = $scope.matches.concat($scope.sens);
        $scope.update();
    });

    $http.get('/data/zips.json').then(function (results) {
        $scope.zips = results.data;
        $scope.update();
    });

    if ($window.innerWidth < 850) {
        $scope.showOffices = false;
    }

    angular.element($window).bind('resize', function (something) {
        if (window.innerWidth < 850) {
            $scope.showOffices = false;
            $scope.$apply();
        }
    });

    parseRouteParams();

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
        if (!sens) {
            sens = [];
        }
        return reps.filter(function (item) {
            return item.state.indexOf(state.toLowerCase()) !== -1;
        }).concat(sens.filter(function (item) {
            return item.state.toLowerCase().indexOf(state.toLowerCase()) !== -1;
        }));
    }

    function lastName(str) {
        var l = str.replace(' Jr', '').split(' ');
        return l[l.length - 1].toLowerCase().trim();
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

    function parseRouteParams() {
        if (!$routeParams) return;

        if ($routeParams.zip) {
            $scope.queryZip = $routeParams.zip;
        } else if ($routeParams.filters) {
            var nums = $routeParams.filters.split('-');
            $scope.chambers.model = nums[0];
            $scope.parties.model = nums[1];
            $scope.houseCommittees.model = nums[2];
            $scope.senateCommittees.model = nums[3];
            $scope.sorting.model = nums[4];
            $scope.queryState = $routeParams.state !== 'n' ? $routeParams.state : '';
            $scope.queryName = $routeParams.name !== 'n' ? $routeParams.name : '';
        }
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
