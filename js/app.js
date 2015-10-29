var ngApp = angular.module('app', ['ngRoute', 'ngTagsInput', 'datetimepicker'])

ngApp.config(['$routeProvider', 'datetimepickerProvider', function ($routeProvider, datetimepickerProvider) {
    toastr.options.closeButton = true;
    $routeProvider
      .when('/add', { templateUrl: 'tpl-edit-release.html', controller: 'ReleaseController' })
      .when('/edit/:index', { templateUrl: 'tpl-edit-release.html', controller: 'ReleaseController' })
      .when('/edit', { templateUrl: 'tpl-edit-release.html', controller: 'ReleaseController' })
      .when('/releases', { templateUrl: 'tpl-releases.html', controller: 'ReleaseController' })
      .otherwise({ redirectTo: '/releases' });

    datetimepickerProvider.setOptions({
        locale: 'en'
    });
}])
.run(['$rootScope', '$location', '$routeParams', function ($rootScope, $location, $routeParams) {
    //$rootScope.$on("$routeChangeStart", function (args) { console.log('routing start'); });
    //$rootScope.$on("$routeChangeSuccess", function (args) {
    //    console.log('routing ended to:', $location.path()); // Get all URL parameter
    //    console.log($routeParams);
    //});

		$rootScope.scoped = {
			format: 'dd-MM-yyyy HH:mm:ss'
		};

		$rootScope.vm = {
			datetime: 'dd/mm/2011 6:30 AM'
		}
	}
]);

ngApp.service('ReleaseService', ['$q', function ($q) {
    var mode = 'local';
    var Items = [];
    var init = function () {
        var a = localStorage.getItem('__ReleaseTracker');
        if (a && a != '') Items= JSON.parse(a); else Items= [];
    }
    init();
    var now = function () {
        return moment().format("DD-MM-YYYY hh:mm:ss");
    }
    var addItem = function (item) {
        var d = $q.defer();
        item.uid = Items.length + 1;
        item.Created = now();
        Items.push(item);
        commit().then(function () { d.resolve('Release detail added.'); });
        return d.promise;
    };

    var getItems = function () {
        return Items;
    };

    var updateItem = function (index, item) {
        var d = $q.defer();
        item.Updated = now();
        Items[index] = item;
        commit().then(function () { d.resolve('Release detail updated.'); });
        return d.promise;
    };

    var commit = function () {
        var d = $q.defer();
        if (mode == 'local') {
            localStorage.setItem('__ReleaseTracker', JSON.stringify(Items));
            console.log('local commit - done');
            d.resolve();
        }
        return d.promise;
    }
    var getMasterData = function () {
        var s = {};
        s.Customers = [
        { id: '1', name: 'Dell' },
        { id: '2', name: 'HP' },
        { id: '3', name: 'Symphony' }
        ];
        s.ReleaseTypes = [
            { id: '1', name: 'Production' },
            { id: '2', name: 'Implementation' },
            { id: '3', name: 'POC' },
            { id: '3', name: 'Testing' }
        ];
        s.Environments = [
            { id: '1', name: 'On-Premise' },
            { id: '2', name: 'Cloud' }
        ];
        return s;
    }
    var selectedItem;
    var selectedRow = function (o) {
        selectedItem = o;
    }
    var getSelectedRow = function () {
        console.log('getSelectedRow:', selectedItem);
    }

    return {
        add: addItem,
        get: getItems,
        update: updateItem,
        master: getMasterData,
        selected: selectedRow,
        getSelected: getSelectedRow
    };
}]);

ngApp.controller('ReleaseController', ['$scope', '$location', 'ReleaseService', '$routeParams', 'filterFilter', function (s, l, service, params, filterFilter) {
    s.Title = 'New Release';
    //to set default selected value
    //s.Item.Customer = { id: '3', name: 'Option C' };
    s.initStorage = function() {
        s.Items = service.get();
        //service.getSelected();
        //console.log('params:', params.index);
        if (params && params.index) {
            s.selectedIndex = Number(params.index);
            s.showedit();
        }
    } 
    s.save = function () {
        if (!s.Item.ReleaseType) {
            toastr.error('Release Type is mandatory', 'Validation')
            return false;
        }
        if (s.editmode) {
            service.update(s.selectedIndex,s.Item).then(function (resp) {
                s.reset();
                toastr.success(resp);
            });
        } else {
            service.add(s.Item).then(function (resp) {
                s.reset();
                toastr.success(resp);
            });
        }
        
    }
    s.edit = function (ind, row) {
        //service.selected(row);
        l.path('/edit/' + ind);
    }
    s.showedit = function () {
        s.editmode = true;
        s.Title = 'Edit Release';
        s.Item = s.Items[s.selectedIndex];
    }
    s.reset = function () {
        s.editmode = false;
        s.Item = {};
    }
     
    s.init = function () {
        var master = service.master();
        s.Customers = master.Customers;
        s.ReleaseTypes = master.ReleaseTypes;
        s.Environments = master.Environments;
        s.initStorage();
    }
     
    s.players = [{ name: 'Gene', team: 'team alpha' },
                   { name: 'George', team: 'team beta' },
                   { name: 'Steve', team: 'team gamma' },
                   { name: 'Paula', team: 'team beta' },
                   { name: 'Scruath of the 5th sector', team: 'team gamma' }];

    var indexedTeams = [];

    s.playersToFilter = function () {
        indexedTeams = [];
        return s.players;
    }

    s.filterTeams = function (player) {
        var teamIsNew = indexedTeams.indexOf(player.team) == -1;
        if (teamIsNew) {
            indexedTeams.push(player.team);
        }
        return teamIsNew;
    }

    var indexedRecords = [];
    s.filterByType = function (item) {
        var teamIsNew = indexedRecords.indexOf(item.ReleaseType.id) == -1;
        if (teamIsNew) {
            indexedRecords.push(item.ReleaseType.name);
        }
        //console.log('teamIsNew:', indexedRecords);
        return teamIsNew;
    }

    s.filtedCnt = function (id) {
        var a=filterFilter(s.Items, { 'ReleaseType.id': id });
        console.log(s.Items,a, id);
    }

    s.init();
}]);



$('#datetimepicker').datetimepicker({
    language: 'en',
    useCurrent: false
});



//examples: toastr

//// Display a warning toast, with no title
//toastr.warning('My name is Inigo Montoya. You killed my father, prepare to die!')

//// Display a success toast, with a title
//toastr.success('Have fun storming the castle!', 'Miracle Max Says')

//// Display an error toast, with a title
//toastr.error('I do not think that word means what you think it means.', 'Inconceivable!')

//// Immediately remove current toasts without using animation
//toastr.remove()

//// Remove current toasts using animation
//toastr.clear()

//// Override global options
//toastr.success('We do have the Kapua suite available.', 'Turtle Bay Resort', { timeOut: 5000 })





//$rootScope.$broadcast('SOME_TAG', 'your value');
//$scope.$on('SOME_TAG', function (response) {
//    // ....
//})






//promise example

//function asyncGreet(name) {
//    var deferred = $q.defer();

//    setTimeout(function () {
//        deferred.notify('About to greet ' + name + '.');

//        if (okToGreet(name)) {
//            deferred.resolve('Hello, ' + name + '!');
//        } else {
//            deferred.reject('Greeting ' + name + ' is not allowed.');
//        }
//    }, 1000);

//    return deferred.promise;
//}

//var promise = asyncGreet('Robin Hood');
//promise.then(function (greeting) {
//    alert('Success: ' + greeting);
//}, function (reason) {
//    alert('Failed: ' + reason);
//}, function (update) {
//    alert('Got notification: ' + update);
//});