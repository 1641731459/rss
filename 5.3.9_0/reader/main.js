// Traverse the parents and find a background page
var bg = Ext.getBackgroundPage();
var run = bg === window;

var backendListeners, backendIsLoaded, onAppReady;
var isMainJs = true

if (run) {
	backendIsLoaded = false;
	backendListeners = [];

	onAppReady = function(fn, loadingCallback) {
		if (backendIsLoaded) {
			return fn();
		}
		backendListeners.push(fn);
		fireCallback(loadingCallback);
	}

	function backendLoadComplete() {
		backendListeners.forEach(function(callback) {
			callback();
		});
		backendListeners = [];
	}

	window.app = new Application();

	chain(Platform.load)
	.and(app['get ready to rumble!'])
	.end(function() {
		// Done init

		if (!localStorage.installedWithTr) {
			if (!app.user.isPro() && app.user.hasFeeds()) {
				localStorage.askForTr = true;
			} else {
				localStorage.askForTr = false;
			}
		}
		localStorage.askForTr = false;
		localStorage.installedWithTr = true;

		if (localStorage.askForTr != "true") {
			if (app.user.preferences.get("global:tr") || !app.user.isPro()) {
				addTr();
			}
		}
	});
}

function addTr() {
	var script = document.createElement("script");
	script.src = "library/tr.js";
	document.body.appendChild(script);
}
