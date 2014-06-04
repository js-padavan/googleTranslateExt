'use-strict'

angular.module("app.controllers", []).
controller('mainController', ['$scope', '$filter', 'words', function($scope, $filter, words){
	// $scope.nativeLanguage = appConfig.data.nativeLanguage;
	$scope.words = words.words;
	$scope.languages = words.languages;

	$scope.$on('$viewContentLoaded', function() {
		words.get($scope.lang.language);
	})

	$scope.removeWord = function($index) {
		words.remove($index);
	}

	$scope.loadWords = function() {
		words.get($scope.lang.language);
	}

	$scope.openGTranslate = function() {
		chrome.tabs.create({ url: "https://translate.google.com" });
	}
}]);
