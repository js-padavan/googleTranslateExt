'use-strict'

var app = angular.module("app", ["ui.router", "app.controllers", "app.services"]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	console.log("running config");
	console.log($stateProvider);
	$urlRouterProvider.otherwise("/");
	console.log('state');
	$stateProvider
		.state('mainpage', {
			url: "/",
			controller: 'mainController',
			templateUrl: "./partials/main.html",
			resolve: {
				langLoad: function(words) {
					return words.getLanguages();
				},
			}
		});
}])