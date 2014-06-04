(function() {
			// user's native language
	var nativeLanguage;



	function init() {
		var deferred = Q.defer();
			// controls templates
		var loader_url = chrome.extension.getURL("img/loading_img.gif")
		var controls = 	"<div class='controls'>" +
							"<span id='save-word-btn'>Save word</span>"+
							"<span class='hidden' id='loader'><img src='" + loader_url + "''><span>Saving...</span></span>" +
							"<span class='msg hidden' id='msg'>This word already saved</span>" + 
						"</div>";
						
			// injecting controls
		var el = $("#gt-lang-right");
			// if element found, then adding controls ther
		if (el) {
			el.append(controls);
		}
		else {
			// Добавлям к body
			deferred.reject();
		}
		

			// getting user's native language
		chrome.storage.local.get('nativeLanguage', function(res) {
			nativeLanguage = res.nativeLanguage;
			deferred.resolve();
		})

		return deferred.promise;
	}

	function setNativeLang() {
			// controls for picking native language
		var languagePickControls = "<div class='lang-pick-wrapper'>" +
										"<div class='note'>" +
											"<span>Please choose your native language, this is requried only once.</span>" +
											"<select id='lang-select'>" +
												"<option></option><option></option>" + 
											"</select>" +
											"<div id='save-lang'>Apply</div>" +
										"</div>" +
									"</div>";
		var deferred = Q.defer();
		var params = document.location.hash.substr(1).split('/');
		$('body').append(languagePickControls);	

			// chaching all dom vars
		var wrapper = $('.lang-pick-wrapper');
		var select = $('#lang-select');
		var button = $('#save-lang');

			// prevent event bubling
		select.click(function(e){
			e.stopImmediatePropagation();
		});
			// when clicking outside of the modal window, it shoud dissapear
		wrapper.click(function(e){
			e.stopImmediatePropagation();
			removeWrapper();
			deferred.reject();
		});

		$('#lang-select > option').first().text(params[0]).val(params[0]);
		$('#lang-select > option').last().text(params[1]).val(params[1]);

		button.click(function(e) {
			e.stopImmediatePropagation();
			var val = select.val();
			chrome.storage.local.set({nativeLanguage: val}, function(){
				nativeLanguage = val;
				removeWrapper();
				deferred.resolve();
					// here also shoud be validation on error while saving to storage
			})
		})
			//removing wrapper
		function removeWrapper() {
			wrapper.remove();
		}

		return deferred.promise;
	}


		// send request for saving to background page, returns promise
	function sendToBackgroundPage(word, translation, language) {
		var deferred = Q.defer();

		chrome.runtime.sendMessage({
			type: "save",
			payload: {
				word: word, 
				translation: translation, 
				language: language
			}
		}, function(response) {
			if (response.status === "success") {
				deferred.resolve();
			}
			else {
				deferred.reject("bad");
			}
		})

		return deferred.promise;
	}


	function manualMode() {
		// manual mode for saving
	}


	manualMode.prototype.set = function() {
		$('#save-word-btn').click(function(event){
			var button = $(this);
			var params = document.location.hash.substr(1).split('/');

			if (!nativeLanguage) {
				setNativeLang().then(startSaving);
			}
			else {
				startSaving();
			}


			function startSaving() {
				event.stopPropagation();
				button.addClass('hidden');
				var loader = $('#loader').removeClass('hidden');
				var word = $('#source').val();
				var translation = $('#result_box>:first-child').text();
				
					// detect where translation and where was word (forexample maybe we are transalting form russian to english)
				var language = params[0];
				if (params[0] === nativeLanguage) {
					var temp = word;
					word = translation;
					translation = temp;
					language = params[1];
				} 

				sendToBackgroundPage(word, translation, language).then(
						// on success
					function() {
						button.removeClass('hidden');
						loader.addClass('hidden');
						$("#msg").addClass("hidden");
					},
						// on fail
					function() {
						button.removeClass('hidden');
						loader.addClass('hidden');
						$("#msg").removeClass('hidden');
					}
				);
			}
			
		})
	}

		// let's rock now!!
	$().ready(function() {
		init().then(function() {
				// after all init done
			var mode = new manualMode()
			mode.set();
		})
	}) 
})();
