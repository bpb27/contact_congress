var app = angular.module('myApp', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when("/", {templateUrl: "home.html"}).when("/about", {templateUrl: "about.html"}).when("/local", {templateUrl: "local.html"}).when("/local/:zip/:state", {templateUrl: "local.html"}).when("/:zip", {templateUrl: "home.html"}).when("/:filters/:state/:name", {templateUrl: "home.html"}).otherwise({templateUrl: "home.html"});

  $locationProvider.html5Mode(true).hashPrefix('!');

});

app.controller('localCtrl', [
  '$scope',
  '$http',
  '$routeParams',
  function($scope, $http, $routeParams) {

    $scope.all = [];
    $scope.displayed = [];
    $scope.queryStreet = '';
    $scope.queryCity = '';
    $scope.queryZip = '';
    $scope.status = 'neutral';
    $scope.statusText = 'Check';
    $scope.titles = [];
    $scope.titleShowing = '';

    $scope.state = {
      model: "5",
      availableOptions: [
        {
          id: "1",
          name: "AL"
        }, {
          id: "2",
          name: "AK"
        }, {
          id: "3",
          name: "AR"
        }, {
          id: "4",
          name: "AZ"
        }, {
          id: "5",
          name: "CA"
        }, {
          id: "6",
          name: "CO"
        }, {
          id: "7",
          name: "CT"
        }, {
          id: "8",
          name: "DE"
        }, {
          id: "9",
          name: "FL"
        }, {
          id: "10",
          name: "GA"
        }, {
          id: "11",
          name: "HI"
        }, {
          id: "12",
          name: "IA"
        }, {
          id: "13",
          name: "ID"
        }, {
          id: "14",
          name: "IL"
        }, {
          id: "15",
          name: "IN"
        }, {
          id: "16",
          name: "KS"
        }, {
          id: "17",
          name: "KY"
        }, {
          id: "18",
          name: "LA"
        }, {
          id: "19",
          name: "MA"
        }, {
          id: "20",
          name: "MD"
        }, {
          id: "21",
          name: "ME"
        }, {
          id: "22",
          name: "MI"
        }, {
          id: "23",
          name: "MN"
        }, {
          id: "24",
          name: "MO"
        }, {
          id: "25",
          name: "MS"
        }, {
          id: "26",
          name: "MT"
        }, {
          id: "27",
          name: "NC"
        }, {
          id: "28",
          name: "ND"
        }, {
          id: "29",
          name: "NE"
        }, {
          id: "30",
          name: "NH"
        }, {
          id: "31",
          name: "NJ"
        }, {
          id: "32",
          name: "NM"
        }, {
          id: "33",
          name: "NV"
        }, {
          id: "34",
          name: "NY"
        }, {
          id: "35",
          name: "OH"
        }, {
          id: "36",
          name: "OK"
        }, {
          id: "37",
          name: "OR"
        }, {
          id: "38",
          name: "PA"
        }, {
          id: "39",
          name: "RI"
        }, {
          id: "40",
          name: "SC"
        }, {
          id: "41",
          name: "SD"
        }, {
          id: "42",
          name: "TN"
        }, {
          id: "43",
          name: "TX"
        }, {
          id: "44",
          name: "UT"
        }, {
          id: "45",
          name: "VT"
        }, {
          id: "46",
          name: "VA"
        }, {
          id: "47",
          name: "WA"
        }, {
          id: "48",
          name: "WI"
        }, {
          id: "49",
          name: "WV"
        }, {
          id: "50",
          name: "WY"
        }
      ]
    };

    $scope.check = function() {
      $scope.statusText = 'Checking';
      var base = 'https://contactingcongress.herokuapp.com/localRep/';
      var state = $scope.state.availableOptions.filter(function(item) {
        return item.id === $scope.state.model;
      })[0].name;
      var param = base + encodeURI([$scope.queryStreet, $scope.queryCity, state, $scope.queryZip].join(' '));
      $http.get(param).then(function(results) {
        $scope.status = 'success';
        $scope.statusText = 'Check';
        $scope.all = parseData(results.data);
        $scope.displayed = $scope.all.slice(0);
        $scope.titles = gatherTitles($scope.displayed);
      }, function(error) {
        $scope.status = 'failure';
        $scope.statusText = 'Check';
      });
    }

    $scope.findState = function(abbr) {
      return $scope.state.availableOptions.filter(function(item) {
        return item.name === abbr;
      })[0];
    }

    $scope.parseParams = function() {
      if ($routeParams) {
        if ($routeParams.zip) {
          $scope.queryZip = $routeParams.zip;
        }
        if ($routeParams.state) {
          var result = $scope.findState($routeParams.state);
          if (result) {
            $scope.state.model = result.id;
          }
        }
      }
    }

    $scope.showOnly = function(title) {
      if ($scope.titleShowing === title) {
        $scope.titleShowing = '';
        $scope.displayed = $scope.all.slice(0);
      } else {
        $scope.displayed = $scope.all.filter(function(item) {
          return item.title === title;
        });
        $scope.titleShowing = title;
      }
    }

    $scope.parseParams();

    function findSocial(list, target) {
      var result = list.filter(function(item) {
        return item.type.toLowerCase() === target.toLowerCase();
      })[0];
      return result
        ? result.id
        : '';
    }

    function gatherTitles(list) {
      return list.filter(function(item) {
        return item.title;
      }).map(function(item) {
        return {'name': item.title};
      });
    }

    function parseData(data) {
      var transformed = data.offices.map(function(item) {
        try {
          var official = data.officials[item['officialIndices'][0]];
          var props = Object.keys(official);
          item['title'] = item['name'];
          props.forEach(function(prop) {
            item[prop] = official[prop];
          });
          return item;
        } catch (e) {
          console.log(e, item);
        }
      }).filter(function(item) {
        if (item) {
          var excluded = ['United States Senate', 'President of the United States', 'Vice-President of the United States'];
          if (excluded.indexOf(item.title) === -1) {
            return item;
          }
        }
      }).map(function(item) {
        if (item.channels && item.channels.length) {
          item['socialFacebook'] = findSocial(item.channels, 'Facebook');
          item['socialInstagram'] = findSocial(item.channels, 'Instagram');
          item['socialTwitter'] = findSocial(item.channels, 'Twitter');
          item['socialYoutube'] = findSocial(item.channels, 'YouTube');
        }
        if (item.address && item.address.length) {
          var o = item.address[0];
          if (o.line2) {
            item.address = o.line1.replace(',', '') + ', ' + o.line2 + ', ' + o.city + ', ' + o.state + ' ' + o.zip;
          } else {
            item.address = o.line1.replace(',', '') + ', ' + o.city + ', ' + o.state + ' ' + o.zip;
          }
        }
        if (item.phones && item.phones.length) {
          var phone = item.phones[0];
          item['phone'] = phone.replace(')', '').replace('(', '').replace(' ', '-');
        }
        return item;
      })
      return transformed;
    }

  }
]);

app.controller('mainCtrl', [
  '$scope',
  '$http',
  '$routeParams',
  '$timeout',
  function($scope, $http, $routeParams, $timeout) {

    $scope.dataAca = true;
    $scope.dataCommittees = true;
    $scope.dataOffices = true;
    $scope.displayed = [];
    $scope.glowing = true;
    $scope.increment = 20;
    $scope.matches = [];
    $scope.queryName = '';
    $scope.queryState = '';
    $scope.queryZip = '';
    $scope.reps = [];
    $scope.sens = [];
    $scope.showOffices = true;
    $scope.sortAsc = true;
    $scope.zips = [];
    $scope.zipMatch = false;
    $scope.zipMatchState = '';

    $scope.selectChambers = {
      model: "1",
      availableOptions: [
        {
          id: "1",
          name: "Both chambers"
        }, {
          id: "2",
          name: "House"
        }, {
          id: "3",
          name: "Senate"
        }
      ]
    };

    $scope.selectParties = {
      model: "1",
      availableOptions: [
        {
          id: "1",
          name: "All Parties"
        }, {
          id: "2",
          name: "Democratic"
        }, {
          id: "3",
          name: "Independent"
        }, {
          id: "4",
          name: "Republican"
        }
      ]
    };

    $scope.selectHouseCommittees = {
      model: "1",
      availableOptions: [
        {
          id: "1",
          name: "All House Committees"
        }, {
          id: "2",
          name: "Agriculture"
        }, {
          id: "3",
          name: "Appropriations"
        }, {
          id: "4",
          name: "Armed Services"
        }, {
          id: "5",
          name: "Budget"
        }, {
          id: "6",
          name: "Education and the Workforce"
        }, {
          id: "7",
          name: "Energy and Commerce"
        }, {
          id: "8",
          name: "Ethics"
        }, {
          id: "9",
          name: "Financial Services"
        }, {
          id: "10",
          name: "Foreign Affairs"
        }, {
          id: "11",
          name: "Homeland Security"
        }, {
          id: "12",
          name: "House Administration"
        }, {
          id: "13",
          name: "Intelligence"
        }, {
          id: "14",
          name: "Judiciary"
        }, {
          id: "15",
          name: "Natural Resources"
        }, {
          id: "16",
          name: "Oversight and Government Reform"
        }, {
          id: "17",
          name: "Rules"
        }, {
          id: "18",
          name: "Science, Space, and Technology"
        }, {
          id: "19",
          name: "Small Business"
        }, {
          id: "20",
          name: "Transportation and Infrastructure"
        }, {
          id: "21",
          name: "Veterans’ Affairs"
        }, {
          id: "22",
          name: "Ways and Means"
        }
      ]
    };

    $scope.selectSenateCommittees = {
      model: "1",
      availableOptions: [
        {
          id: "1",
          name: "All Senate Committees"
        }, {
          id: "2",
          name: "Appropriations"
        }, {
          id: "3",
          name: "Agriculture, Nutrition and Forestry"
        }, {
          id: "4",
          name: "Armed Services"
        }, {
          id: "5",
          name: "Banking, Housing, and Urban Affairs"
        }, {
          id: "6",
          name: "Budget"
        }, {
          id: "7",
          name: "Commerce, Science, and Transportation"
        }, {
          id: "8",
          name: "Energy and Natural Resources"
        }, {
          id: "9",
          name: "Environment and Public Works"
        }, {
          id: "10",
          name: "Ethics"
        }, {
          id: "11",
          name: "Finance"
        }, {
          id: "12",
          name: "Foreign Relations"
        }, {
          id: "13",
          name: "Health, Education, Labor and Pensions"
        }, {
          id: "14",
          name: "Homeland Security and Governmental Affairs"
        }, {
          id: "15",
          name: "Indian Affairs"
        }, {
          id: "16",
          name: "Intelligence"
        }, {
          id: "17",
          name: "Judiciary"
        }, {
          id: "18",
          name: "Rules and Administration"
        }, {
          id: "19",
          name: "Small Business and Entrepreneurship"
        }, {
          id: "20",
          name: "Veterans' Affairs"
        }
      ]
    };

    $scope.selectSorting = {
      model: "1",
      availableOptions: [
        {
          id: "1",
          name: "Order by State"
        }, {
          id: "2",
          name: "Order by First name"
        }, {
          id: "3",
          name: "Order by Last name"
        }, {
          id: "4",
          name: "Order by Year first elected"
        }, {
          id: "5",
          name: "Order by Reelection year"
        }, {
          id: "6",
          name: "Order by Elected by %"
        }, {
          id: "7",
          name: "Order by Trump vote %"
        }, {
          id: "8",
          name: "Order by Clinton vote %"
        }, {
          id: "9",
          name: "Order by ACA enrollees"
        }
      ]
    };

    $scope.chooseCommittee = function(committee, member) {
      if (member.district) {
        var choice = $scope.selectHouseCommittees.availableOptions.filter(function(c) {
          return c.name === committee;
        })[0].id;
        $scope.selectHouseCommittees.model = $scope.selectHouseCommittees.model === choice
          ? "1"
          : choice;
      } else {
        var choice = $scope.selectSenateCommittees.availableOptions.filter(function(c) {
          return c.name === committee;
        })[0].id;
        $scope.selectSenateCommittees.model = $scope.selectSenateCommittees.model === choice
          ? "1"
          : choice;
      }
    }

    $scope.generateLink = function() {
      var base = "http://www.contactingcongress.org/";
      var message = 'Copy text below (PC: ctrl + c) (Mac: cmd + c)';
      if ($scope.queryZip.length === 5 && $scope.zips[$scope.queryZip]) {
        prompt(message, base + $scope.queryZip);
      } else {
        var nums = [$scope.selectChambers.model, $scope.selectParties.model, $scope.selectHouseCommittees.model, $scope.selectSenateCommittees.model, $scope.selectSorting.model].join('-');
        var link = base + [
          nums, $scope.queryState || 'n',
          $scope.queryName || 'n'
        ].join('/');
        if (link === 'http://www.contactingcongress.org/1-1-1-1-1/n/n') {
          prompt(message, 'http://www.contactingcongress.org/');
        } else {
          prompt(message, link);
        }
      }
    }

    $scope.more = function() {
      $scope.increment = $scope.increment + 20;
      $scope.update(true);
    }

    $scope.parseRouteParams = function() {
      if (!$routeParams)
        return;

      if ($routeParams.zip) {
        $scope.queryZip = $routeParams.zip;
      } else if ($routeParams.filters) {
        var nums = $routeParams.filters.split('-');
        $scope.selectChambers.model = nums[0];
        $scope.selectParties.model = nums[1];
        $scope.selectHouseCommittees.model = nums[2];
        $scope.selectSenateCommittees.model = nums[3];
        $scope.selectSorting.model = nums[4];
        $scope.queryState = $routeParams.state !== 'n'
          ? $routeParams.state
          : '';
        $scope.queryName = $routeParams.name !== 'n'
          ? $routeParams.name
          : '';
      }
    }

    $scope.toggleFilter = function(item) {
      item.toggle = !item.toggle;
    };

    $scope.toggleShowOffices = function() {
      $scope.showOffices = !$scope.showOffices;
    };

    $scope.update = function(noReset) {

      $scope.increment = !noReset
        ? 20
        : $scope.increment;
      $scope.zipMatch = false;

      var reps = !$scope.reps || $scope.selectChambers.model === '3'
        ? []
        : $scope.reps;
      var sens = !$scope.sens || $scope.selectChambers.model === '2'
        ? []
        : $scope.sens;

      if ($scope.selectHouseCommittees.model !== "1") {
        var houseComm = findByValue('id', $scope.selectHouseCommittees.model, $scope.selectHouseCommittees.availableOptions)[0];
        reps = findByValueContains('committees', houseComm.name, reps);
        sens = [];
      }

      if ($scope.selectSenateCommittees.model !== "1") {
        var senComm = findByValue('id', $scope.selectSenateCommittees.model, $scope.selectSenateCommittees.availableOptions)[0];
        sens = findByValueContains('committees', senComm.name, sens);
        reps = [];
      }

      if ($scope.selectParties.model !== "1") {
        var party = findByValue('id', $scope.selectParties.model, $scope.selectParties.availableOptions)[0];
        sens = findByValue('party', party.name, sens);
        reps = findByValue('party', party.name, reps);
      }

      if ($scope.zips[$scope.queryZip]) {
        $scope.matches = findByDistrict(parseDistricts($scope.zips[$scope.queryZip]), reps, sens);
        $scope.zipMatch = true;
        try {
          $scope.zipMatchState = $scope.abbreviations[$scope.zips[$scope.queryZip].split(' ')[0].replace('_', ' ')];
        } catch (e) {
          console.log(e);
        }
      } else if ($scope.queryName && $scope.queryState) {
        $scope.matches = findByState($scope.queryState, findByName($scope.queryName, reps, sens));
      } else if ($scope.queryName) {
        $scope.matches = findByName($scope.queryName, reps, sens);
      } else if ($scope.queryState) {
        $scope.matches = findByState($scope.queryState, reps, sens);
      } else {
        $scope.matches = reps.concat(sens);
      }

      var sortedMatches = $scope.matches.sort(function(a, b) {
        return sortingRules($scope.selectSorting.model, a, b);
      });

      $scope.displayed = !$scope.sortAsc
        ? sortedMatches.reverse().slice(0, $scope.increment)
        : sortedMatches.slice(0, $scope.increment);

    }

    $scope.$watchGroup([
      'queryName',
      'queryState',
      'queryZip',
      'selectChambers.model',
      'selectParties.model',
      'selectHouseCommittees.model',
      'selectSenateCommittees.model',
      'selectSorting.model',
      'sortAsc'
    ], function() {
      $scope.update();
    });

    $http.get('/data/reps2.json').then(function(results) {
      $scope.reps = addDates(results.data, 2018);
      $scope.matches = $scope.matches.concat($scope.reps);
      $scope.update();
    });

    $http.get('/data/sens.json').then(function(results) {
      $scope.sens = addDates(results.data);
      $scope.matches = $scope.matches.concat($scope.sens);
      $scope.update();
    });

    $http.get('/data/zips.json').then(function(results) {
      $scope.zips = results.data;
      $scope.update();
    });

    $http.get('/data_reference/state_abbreviations.json').then(function(results) {
      $scope.abbreviations = results.data;
    });

    $scope.parseRouteParams();

    function addDates(group, reelectionYear) {
      return group.map(function(item) {
        item['reelection'] = moment('11-03-' + (
        item.yearReelection || reelectionYear)).fromNow();
        item['elected'] = moment('11-06-' + item.yearElected).fromNow();
        return item;
      });
    }

    function findByDistrict(districts, reps, sens) {
      var state = districts[0].split(' ')[0];
      return reps.filter(function(item) {
        return districts.indexOf(item.state + ' ' + item.district) !== -1;
      }).concat(sens.filter(function(item) {
        return item.state === state;
      }));
    }

    function findByName(name, reps, sens) {
      return reps.filter(function(item) {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
      }).concat(sens.filter(function(item) {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
      }));
    }

    function findByState(state, reps, sens) {
      state = state.replace(' ', '_');
      if (!sens) {
        sens = [];
      }
      return reps.filter(function(item) {
        return item.state.indexOf(state.toLowerCase()) !== -1;
      }).concat(sens.filter(function(item) {
        return item.state.toLowerCase().indexOf(state.toLowerCase()) !== -1;
      }));
    }

    function findByValue(prop, val, list) {
      return list.filter(function(item) {
        return item[prop] === val;
      });
    }

    function findByValueContains(prop, val, list) {
      return list.filter(function(item) {
        return item[prop].indexOf(val) !== -1;
      });
    }

    function lastName(str) {
      var l = str.replace(' Jr', '').split(' ');
      return l[l.length - 1].toLowerCase().trim();
    }

    function parseDistricts(str) {
      if (str.indexOf(',') !== -1) {
        var state = str.split(' ')[0];
        var nums = str.split(' ')[1].split(',');
        return nums.map(function(num) {
          return state + ' ' + num;
        });
      }
      return [str];
    }

    function sortHelper(conditionOne, conditionTwo) {
      if (conditionOne < conditionTwo) {
        return -1;
      } else if (conditionOne > conditionTwo) {
        return 1;
      } else {
        return 0;
      }
    }

    function sortingRules(sortId, a, b) {
      if (sortId === "1") {
        var num = sortHelper(a.stateDisplay.toLowerCase(), b.stateDisplay.toLowerCase());
        return num === 0
          ? sortHelper(a.district || 0, b.district || 0)
          : num;
      }
      if (sortId === "2") {
        return sortHelper(a.name.split(' ')[0].toLowerCase().trim(), b.name.split(' ')[0].toLowerCase().trim());
      }
      if (sortId === "3") {
        return sortHelper(lastName(a.name), lastName(b.name));
      }
      if (sortId === "4") {
        return sortHelper(parseInt(a.yearElected.replace('*', '')), parseInt(b.yearElected.replace('*', '')))
      }
      if (sortId === "5") {
        return sortHelper(parseInt(a.yearReelection.replace('*', '')), parseInt(b.yearReelection.replace('*', '')));
      }
      if (/[6-9]/.test(sortId)) {
        var numberProps = {
          '6': 'votePersonal',
          '7': 'voteTrump',
          '8': 'voteClinton',
          '9': 'numbersAca'
        };
        return sortHelper(parseInt(a[numberProps[sortId]]), parseInt(b[numberProps[sortId]]));
      }
    }

  }
]);

app.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];
    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
        scope.$apply(attr.whenScrolled);
      }
    );
  };
});
