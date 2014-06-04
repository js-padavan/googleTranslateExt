
'use-strict'

angular.module("app.services", []).
service('words', ['$rootScope', '$q', function($rootScope, $q){
	var self = this;
	this.words = [];
	this.languages = [];

	this.get = function(language) {
		console.log("looking for ", language);
		if (!language) {
			return;
		}
		chrome.runtime.sendMessage({type: "get", value: {lang: language}}, function(response) {
			if (response && response.length > 0) {
				self.words.length = 0;
				self.words.push.apply(self.words, response);
				$rootScope.$apply();
			}
		})
	}

	this.remove = function(index) {
		var key = self.words[index].word;
		chrome.runtime.sendMessage({type: "remove", key: key}, function(response) {
			console.log(response);
			if (response.status === "success") {
				self.words.splice(index, 1);
				$rootScope.$apply();
			}
		})
	}

	this.getLanguages = function() {
		var deferred = $q.defer();
		console.log("get languages");
		self.languages.length = [];
		chrome.runtime.sendMessage({type: "getLanguages"}, function(response) {
			console.log(response);
			if (response.status === "success") {
				console.log("success");
				self.languages.push.apply(self.languages, response.value);
				$rootScope.$apply();
				console.log("lang resolved!!");
				deferred.resolve();
			}
			else {
				deferred.reject();
			}
		})

		return deferred.promise;
	}
}]);
