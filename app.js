var app = angular.module('myApp', ['ngRoute', 'ngAnimate']);

app.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when("/", {
			templateUrl: "home.html"
		})
		.when("/about", {
			templateUrl: "about.html"
		})
		.when("/local", {
			templateUrl: "local.html"
		})
		.when("/local/:zip/:state", {
			templateUrl: "local.html"
		})
		.when("/state/:state", {
			templateUrl: "state.html"
		})
		.when("/list/:list", {
			templateUrl: "list.html"
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

app.controller('listCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

	$scope.asc = true;
	$scope.listMembers = '';
	$scope.listName = $routeParams && $routeParams.list ? $routeParams.list : 'Alabama4';
	$scope.matches = [];
	$scope.morePhones = false;
	$scope.reps = [];
	$scope.selectedMember = {};
	$scope.sens = [];

	$scope.selectSorting = {
		model: '1',
		availableOptions: [
			{ id: "1", name: "Order by State" },
			{ id: "2", name: "Order by First name" },
			{ id: "3", name: "Order by Last name" }
		]
	};

	$scope.$watchGroup([
		'selectSorting.model',
		'asc',
		'listMembers'
	], function () {
		$scope.update();
	});

	$scope.selectMember = function (member) {
		$scope.selectedMember = member;
	}

	$scope.update = function () {

		if (!$scope.listMembers) return;

		var sortId = $scope.selectSorting.model;
		var pool = $scope.reps.concat($scope.sens);
		var matches = pool.filter(function (item) {
			return $scope.listMembers.indexOf(item.id) !== -1;
		}).sort(function (a, b) {
			if (sortId === "1") {
				var num = sortHelper(a.stateDisplay.toLowerCase(), b.stateDisplay.toLowerCase());
				return num === 0 ? sortHelper(a.district || 0, b.district || 0) : num;
			}
			if (sortId === "2") {
				return sortHelper(a.name.split(' ')[0].toLowerCase().trim(), b.name.split(' ')[0].toLowerCase().trim());
			}
			if (sortId === "3") {
				return sortHelper(lastName(a.name), lastName(b.name));
			}
		});

		$scope.matches = $scope.asc ? matches : matches.reverse();

		if (!Object.keys($scope.selectedMember).length) {
			$scope.selectedMember = $scope.matches[0];
		}

	}

	$http.get('//contacting-congress-server.herokuapp.com/lists/' + $scope.listName).then(function (results) {
		$scope.listMembers = results.data[0].text;
		console.log(results);
	}, function (error) {
		console.log(error);
	});

	$http.get('/data/reps.json').then(function (results) {
		$scope.reps = addSelected(results.data);
		$scope.update();
	});

	$http.get('/data/sens.json').then(function (results) {
		$scope.sens = addSelected(results.data);
		$scope.update();
	});

	function addSelected(list) {
		return list.map(function (item) {
			item.selected = false;
			return item;
		});
	}

	function lastName(str) {
		var l = str.replace(' Jr', '').split(' ');
		return l[l.length - 1].toLowerCase().trim();
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

}]);

app.controller('localCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

	$scope.all = [];
	$scope.displayed = [];
	$scope.queryStreet = '';
	$scope.queryCity = '';
	$scope.queryZip = '';
	$scope.state = { model: "5", availableOptions: selectData.state.slice() };
	$scope.status = 'neutral';
	$scope.statusText = 'Check';
	$scope.titles = [];
	$scope.titleShowing = '';

	$scope.check = function () {
		var base = 'https://contactingcongress.herokuapp.com/localRep/';
		var state = findByValue('id', $scope.state.model, $scope.state.availableOptions)[0].name;
		var url = base + encodeURI([$scope.queryStreet, $scope.queryCity, state, $scope.queryZip].join(' '));

		$scope.statusText = 'Checking';

		$http.get(url).then(function (results) {
			$scope.status = 'success';
			$scope.statusText = 'Check';
			$scope.all = parseData(results.data);
			$scope.displayed = $scope.all.slice(0);
			$scope.titles = gatherTitles($scope.displayed);
		}, function (error) {
			$scope.status = 'failure';
			$scope.statusText = 'Check';
		});

	}

	$scope.findState = function (abbr) {
		return findByValue('name', abbr, $scope.state.availableOptions)[0];
	}

	$scope.parseParams = function () {
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

	$scope.showOnly = function (title) {
		if ($scope.titleShowing === title) {
			$scope.titleShowing = '';
			$scope.displayed = $scope.all.slice(0);
		} else {
			$scope.displayed = $scope.all.filter(function (item) {
				return item.title === title;
			});
			$scope.titleShowing = title;
		}
	}

	$scope.parseParams();

	function findByValue(prop, val, list) {
		return list.filter(function (item) {
			return item[prop] === val;
		});
	}

	function findSocial(list, target) {
		var result = list.filter(function (item) {
			return item.type.toLowerCase() === target.toLowerCase();
		})[0];
		return result ? result.id : '';
	}

	function gatherTitles(list) {
		return list.filter(function (item) {
			return item.title;
		}).map(function (item) {
			return {
				'name': item.title
			};
		});
	}

	function parseData(data) {
		var transformed = data.offices.map(function (item) {
			try {
				var official = data.officials[item['officialIndices'][0]];
				var props = Object.keys(official);
				item['title'] = item['name'];
				props.forEach(function (prop) {
					item[prop] = official[prop];
				});
				return item;
			} catch (e) {
				console.log(e, item);
			}
		}).filter(function (item) {
			if (item) {
				var excluded = [
					'United States Senate',
					'President of the United States',
					'Vice-President of the United States'
				];
				if (excluded.indexOf(item.title) === -1) {
					return item;
				}
			}
		}).map(function (item) {
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

}]);

app.controller('mainCtrl', ['$scope', '$http', '$routeParams', '$timeout', function ($scope, $http, $routeParams, $timeout) {

	$scope.creatingList = false;
	$scope.dataAca = false;
	$scope.dataCommittees = true;
	$scope.dataOffices = true;
	$scope.displayed = [];
	$scope.glowing = true;
	$scope.increment = 20;
	$scope.listName = '';
	$scope.matches = [];
	$scope.queryName = '';
	$scope.queryState = '';
	$scope.queryZip = '';
	$scope.reps = [];
	$scope.sens - [];
	$scope.selectChambers = { model: '1', availableOptions: selectData.chambers.slice() };
	$scope.selectParties = { model: '1', availableOptions: selectData.parties.slice() };
	$scope.selectHouseCommittees = { model: '1', availableOptions: selectData.houseCommittees.slice() };
	$scope.selectSenateCommittees = { model: '1', availableOptions: selectData.senateCommittees.slice() };
	$scope.selectSorting = { model: '1', availableOptions: selectData.sorting.slice() };
	$scope.showOffices = true;
	$scope.sortAsc = true;
	$scope.zips = [];
	$scope.zipMatch = false;
	$scope.zipMatchState = '';

	$scope.chooseCommittee = function (committee, member) {
		var chamberCommittees = member.district ? $scope.selectHouseCommittees : $scope.selectSenateCommittees;
		var choice = chamberCommittees.availableOptions.filter(function (c) {
			return c.name === committee;
		})[0].id;
		chamberCommittees.model = chamberCommittees.model === choice ? '1' : choice;
	}

	$scope.generateLink = function () {
		var base = 'http://www.contactingcongress.org/';
		var message = 'Copy link below (PC: ctrl + c) (Mac: cmd + c)';

		if ($scope.zips[$scope.queryZip]) {
			return prompt(message, base + $scope.queryZip);
		} else {
			var nums = [$scope.selectChambers.model, $scope.selectParties.model, $scope.selectHouseCommittees.model, $scope.selectSenateCommittees.model, $scope.selectSorting.model].join('-');
			var link = base + [nums, $scope.queryState || 'n', $scope.queryName || 'n'].join('/');
			return link.indexOf('1-1-1-1-1/n/n') !== -1 ? prompt(message, base) : prompt(message, link);
		}
	}

	$scope.getAllData = function () {
		$http.get('/data/reps.json').then(function (results) {
			$scope.reps = addSelected(addDates(results.data, 2018));
			$scope.matches = $scope.matches.concat($scope.reps);
			$scope.update();
		});

		$http.get('/data/sens.json').then(function (results) {
			$scope.sens = addSelected(addDates(results.data));
			$scope.matches = $scope.matches.concat($scope.sens);
			$scope.update();
		});

		$http.get('/data/zips.json').then(function (results) {
			$scope.zips = results.data;
			$scope.update();
		});

		$http.get('/data_reference/state_abbreviations.json').then(function (results) {
			$scope.abbreviations = results.data;
		});
	}

	$scope.more = function () {
		$scope.increment = $scope.increment + 20;
		$scope.update(true);
	}

	$scope.parseRouteParams = function () {
		if (!$routeParams) return;

		if ($routeParams.zip) {
			$scope.queryZip = $routeParams.zip;
		} else if ($routeParams.filters) {
			var nums = $routeParams.filters.split('-');
			$scope.selectChambers.model = nums[0];
			$scope.selectParties.model = nums[1];
			$scope.selectHouseCommittees.model = nums[2];
			$scope.selectSenateCommittees.model = nums[3];
			$scope.selectSorting.model = nums[4];
			$scope.queryState = $routeParams.state !== 'n' ? $routeParams.state : '';
			$scope.queryName = $routeParams.name !== 'n' ? $routeParams.name : '';
		}
	}

	$scope.saveList = function () {
		var button = '#list-creation button.btn-success';
		var input = '#list-creation input[type=text]';
		var name = $(input).val() || '';

		var listMembers = findByValue('selected', true, $scope.matches).map(function (item) {
			return item.id;
		}).join(',');

		var data = {
			text: listMembers,
			name: name.replace(' ', '')
		};

		if (!name || !listMembers) {
			alert('Your list needs a name AND list items. No slacking.');
		} else {
			$(button).text('Saving...');
			$http.post('//contacting-congress-server.herokuapp.com/lists/create', data).then(function (results) {
				console.log(results);
				$(button).text('Success! Copy link above.');
				$(input).val('www.contactingcongress.org/list/' + name);
				$(input).select();
			}, function (error) {
				console.log(error);
				$(button).text('Oops, list not created.');
			});
		}
	}

	$scope.selectShowing = function (value) {
		$scope.matches.map(function (item) {
			item.selected = value;
			return item;
		});
	}

	$scope.update = function (noReset) {

		$scope.increment = !noReset ? 20 : $scope.increment;
		$scope.zipMatch = false;

		var reps = !$scope.reps || $scope.selectChambers.model === '3' ? [] : $scope.reps;
		var sens = !$scope.sens || $scope.selectChambers.model === '2' ? [] : $scope.sens;

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

		var sortedMatches = $scope.matches.sort(function (a, b) {
			return sortingRules($scope.selectSorting.model, a, b);
		});

		$scope.displayed = !$scope.sortAsc ? sortedMatches.reverse().slice(0, $scope.increment) : sortedMatches.slice(0, $scope.increment);

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
	], function () {
		$scope.update();
	});

	$scope.getAllData();
	$scope.parseRouteParams();

	$timeout(function () {
		$scope.glowing = false;
	}, 6000);

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

	function addSelected(list) {
		return list.map(function (item) {
			item.selected = false;
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

	function findByValue(prop, val, list) {
		return list.filter(function (item) {
			return item[prop] === val;
		});
	}

	function findByValueContains(prop, val, list) {
		return list.filter(function (item) {
			return item[prop].indexOf(val) !== -1;
		});
	}

	function lastName(str) {
		var l = str.replace(' Jr', '').split(' ');
		return l[l.length - 1].toLowerCase().trim();
	}

	function limitToList(reps, list) {
		return reps.filter(function (rep) {
			return list.indexOf(rep.id) !== -1;
		});
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
			return num === 0 ? sortHelper(a.district || 0, b.district || 0) : num;
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
			var prop = '';

			if (sortId === '6') {
				prop = 'votePersonal';
			}
			if (sortId === '7') {
				prop = 'voteTrump';
			}
			if (sortId === '8') {
				prop = 'voteClinton';
			}
			if (sortId === '9') {
				prop = 'numbersAca';
			}

			return sortHelper(parseInt(a[prop]), parseInt(b[prop]));

		}
	}

}]);

app.controller('stateCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

	$scope.displayed = [];
	$scope.increment = 20;
	$scope.matches = [];
	$scope.lower = [];
	$scope.queryName = '';
	$scope.queryZip = '';
	$scope.showDemocrat = true;
	$scope.showLower = true;
	$scope.showRepublican = true;
	$scope.showUpper = true;
	$scope.state = ($routeParams && $routeParams.state ? $routeParams.state : 'ca').toLowerCase();
	$scope.upper = [];
	$scope.zips = {};

	$scope.$watchGroup([
		'queryName',
		'queryZip',
		'showDemocrat',
		'showRepublican',
		'showLower',
		'showUpper'
	], function () {
		$scope.update();
	});

	$scope.generateLink = function () {
		var message = 'Copy text below (PC: ctrl + c) (Mac: cmd + c)';
		var url = 'http://www.contactingcongress.org/state' + $scope.state;
		prompt(message, url);
	}

	$scope.more = function () {
		$scope.increment = $scope.increment + 20;
		$scope.update(true);
	}

	$scope.update = function (scrolling) {

		if (!scrolling) {

			var members = [];

			if ($scope.showLower) members = members.concat($scope.lower);
			if ($scope.showUpper) members = members.concat($scope.upper);

			$scope.increment = 20;

			if ($scope.zips[$scope.queryZip]) {
				var match = $scope.zips[$scope.queryZip];
				var matches = [];
				if ($scope.showLower) {
					matches = matches.concat(findByDistrict($scope.lower, match.lower));
				}
				if ($scope.showUpper) {
					matches = matches.concat(findByDistrict($scope.upper, match.upper));
				}
				$scope.matches = matches;
			} else if ($scope.queryName) {
				$scope.matches = members.filter(function (item) {
					return item.name.toLowerCase().indexOf($scope.queryName.toLowerCase()) !== -1;
				});
			} else {
				$scope.matches = members;
			}

		}

		if (!$scope.showDemocrat || !$scope.showRepublican) {
			var filteredParties = [];
			if (!$scope.showDemocrat) filteredParties.push('democratic');
			if (!$scope.showRepublican) filteredParties.push('republican');
			$scope.matches = $scope.matches.filter(function (item) {
				return filteredParties.indexOf(item.party.toLowerCase()) === -1;
			});
		}

		$scope.displayed = $scope.matches.slice(0, $scope.increment);

	}

	$http.get('/states/' + $scope.state + '_lower.json').then(function (results) {
		$scope.lower = tranformData(results.data, 'Rep');
		$scope.matches = $scope.matches.concat($scope.lower);
		$scope.displayed = $scope.matches.slice(0, $scope.increment);
	});

	$http.get('/states/' + $scope.state + '_upper.json').then(function (results) {
		$scope.upper = tranformData(results.data, 'Sen');
		$scope.matches = $scope.matches.concat($scope.upper);
		$scope.displayed = $scope.matches.slice(0, $scope.increment);
	});

	$http.get('/states/' + $scope.state + '_zips.json').then(function (results) {
		$scope.zips = results.data;
	});

	function findByDistrict(list, districts) {
		districts = districts.split(',');
		return list.filter(function (item) {
			if (districts.indexOf(item.district.toString()) !== -1) return true;
		});
	}

	function findSocial(list, target) {
		var result = list.filter(function (item) {
			return item.type.toLowerCase() === target.toLowerCase();
		})[0];
		return result ? result.id : '';
	}

	function tranformData(data, title) {
		return data.map(function (item) {
			if (item.channels && item.channels.length) {
				item['socialFacebook'] = findSocial(item.channels, 'Facebook');
				item['socialInstagram'] = findSocial(item.channels, 'Instagram');
				item['socialTwitter'] = findSocial(item.channels, 'Twitter');
				item['socialYoutube'] = findSocial(item.channels, 'YouTube');
			}
			if (item.address && item.address.length) {
				var o = item.address[0];

				o.line1 = o.line1.replace('PO BOX', 'P.O. Box');

				if (o.line2) {
					o.line2 = o.line2.replace('PO BOX', 'P.O. Box');
					if (o.line2.indexOf('P.O. Box') !== -1) {
						item.address = o.line2.replace(',', '') + ', ' + o.city + ', ' + o.state + ' ' + o.zip;
					} else {
						item.address = o.line1.replace(',', '') + ', ' + o.line2 + ', ' + o.city + ', ' + o.state + ' ' + o.zip;
					}
				} else {
					item.address = o.line1.replace(',', '') + ', ' + o.city + ', ' + o.state + ' ' + o.zip;
				}
			}
			if (item.phones && item.phones.length) {
				var phone = item.phones[0];
				item['phone'] = phone.replace(')', '').replace('(', '').replace(' ', '-');
			}
			item.memberTitle = title;
			return item;
		})
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
