var myApp = angular.module('app', ['ui.router']);


myApp.service('BlockchainService', function($rootScope, $http) {

    var blockchainService = {};

    // initializing some global variables
    deployedContract = MetaCoin.deployed();
    accounts = window.web3.eth.accounts;

    blockchainService.getAccounts = function() {
        return accounts;
    }

    blockchainService.refreshBalance = function(from_account) {
        // getBalance function is a promise. Since we have to call it
        // once per account, we better store all the promise in an array
        // and resolve them using Promise.all()
        // This final promise is return so that the final function only has
        // to make one promise
        var promises = [];
        for (var i = 0; i < accounts.length; i++) {
            promises.push(
                deployedContract.getBalance.call(accounts[i], {from: from_account}).then( function(value){
                    return value.toNumber();
                })
            );
        }
        return Promise.all(promises).then(function(values){
            balances = {};
            for (var i = 0; i < values.length; i++) {
                balances[accounts[i]] = values[i];
            }
            return balances;
        });
    };

    blockchainService.sendCoin = function(to_address, amount) {
        return deployedContract.sendCoin(to_address, amount, {from: accounts[0]});
    }


    return blockchainService;
})

myApp.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            abstract: true,
            templateUrl: 'app/with-menu/with-menu.html'
        })
        .state('home.pageA', {
            url: '/pageA',
            templateUrl: 'app/with-menu/pageA/pageA.html'
        })
        .state('home.pageB', {
            url: '/pageB',
            templateUrl: 'app/with-menu/pageB/pageB.html'
        })
        .state('home.blockchain', {
            url: '/blockchain',
            templateUrl: 'app/with-menu/blockchain/blockchain.html',
            controller: 'blockchainController'
        });
    $urlRouterProvider.when('/home', '/home/pageA');
    $urlRouterProvider.when('', '/home');
});


myApp.controller('blockchainController', function (BlockchainService, $scope, $rootScope) {
    $scope.accounts = BlockchainService.getAccounts();

    $scope.ctrlRefreshBalance = function(from_account) {
        BlockchainService.refreshBalance(from_account).then(function(value) {
            $scope.balances = value;
            $scope.$apply();
        });
    };

    $scope.ctrlSendCoin = function(to_address, amount) {
        BlockchainService.sendCoin(to_address, amount).then(function() {
            $scope.ctrlRefreshBalance($scope.accounts[0]);
        })
    }
});
