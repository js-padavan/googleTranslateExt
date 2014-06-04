function Db() {

	if (!window.indexedDB) {
		alert("your browser doesn't support indexedDB");
	}

	var self = this;
	this.db = undefined;

	var IDbRequest = window.indexedDB.open('words', 1);
	
	IDbRequest.onsuccess=function(e) {
		console.log("successfully connected");
		self.db = e.target.result;
	}
	IDbRequest.onerror = function(e) {
		console.log("filed to connect");
		console.log(e);
	}

		// creating schemas
	IDbRequest.onupgradeneeded = function(event) {
		var db = event.target.result;

		var objectStore = db.createObjectStore("words", {keyPath: "word"});
		objectStore.createIndex("word", "word", {unique: true});
		objectStore.createIndex("language", "language", {unique: false});
	}
} 

Db.prototype.save = function(entity) {
	console.log('saving');
	var deferred = Q.defer();
	var transaction = this.db.transaction(["words"], "readwrite");
	
	transaction.oncomplete = function(e) {
		console.log("all works");
		deferred.resolve();
	}

	transaction.onerror = function(e) {
		console.log('error',e);
		deferred.reject("error");
	}

	var objectStore = transaction.objectStore("words");
	entity.date = Date.now();
	objectStore.add(entity);

	return deferred.promise;
}

Db.prototype.get = function(lang) {
	var result = [];
	var deferred = Q.defer();
	var range = IDBKeyRange.only(lang);
	var request = this.db.transaction("words").objectStore("words").index("language").openCursor(range);
	request.onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			result.push(cursor.value);
			cursor.continue();
		}
		else {
			deferred.resolve(result);
		}
	}
	return deferred.promise;
}

Db.prototype.remove = function(key) {
	var deferred = Q.defer();
	var transaction = this.db.transaction(["words"], "readwrite");
	
	transaction.oncomplete = function(e) {
		console.log("all works");
		deferred.resolve();
	}

	transaction.onerror = function(e) {
		console.log('error',e);
		deferred.reject();
	}

	var objectStore = transaction.objectStore("words");
	objectStore.delete(key);

	return deferred.promise;
}

Db.prototype.getLanguages = function() {
	var deferred = Q.defer();
	var transaction = this.db.transaction(["words"], "readwrite");

	transaction.onerror = function(e) {
		deferred.reject()
	}

	var result = [];

	var request = transaction.objectStore("words").index("language").openCursor(null, "nextunique");
	request.onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			result.push(cursor.value);
			cursor.continue();
		}
		else {
			deferred.resolve(result);
		}
	}

	return deferred.promise;
}


var database = new Db();

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse){
	console.log(req);
	switch (req.type) {
		case "get" : 
			console.log(req.value.lang);
			database.get(req.value.lang).then(function(result) {
				sendResponse(result);
			})
			break;
		case "save" :
			if (req.payload) {
				database.save(req.payload).then(function() {
					sendResponse({type: "save", status: "success"});
				},
				function() {
					sendResponse({type: "save", status: "error"});
				})
			}
			break;
		case "remove" : {
			if (req.key) {
				database.remove(req.key).then(function() {
					sendResponse({type: "remove", status: "success"});
				})
			}
		}
		case "getLanguages" : {
			database.getLanguages().then(
				function(result) {
					sendResponse({type: "getLanguages", status: "success", value: result});
				},
				function(){
					sendResponse({type: "getLanguages", status: "error"});
			})
		}
	}
	return true;

})