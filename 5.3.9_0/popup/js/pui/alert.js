PUI.Alert = PUI.Modal.extend({
	initialize: function(text, okButton) {
		this._super();
		
		this.container.addClass('pui-alert');		
		this.container.append($('<div class="pui-alert-text"></div>'));
		this.container.append($('<div class="pui-button"></div>').text(okButton || "Okay").click(this.onClick));
		
		$("body").addClass("pui-modal-confirm");

		this.setText(text);
	},

	destroy: function() {
		this._super();
		$("body").removeClass("pui-modal-confirm");
	},
	
	onClick: function() {
		this.destroy();
		fireCallback(this.okCallback);
	},
	
	ok: function(func) {
		this.okCallback = func;
		return this;
	}
});

PUI.alert = function(text, okButton) {
	var win = new PUI.Alert(text, okButton);
	win.show();
	return win;
};

PUI.alertLoader = function(text) {
	var win = new PUI.Alert(text);
	win.container.addClass('pui-loading');
	win.show();
	return win;
}

PUI.alertError = function(text) {
	PUI.alert(text + "\nIf the problem persists, visit <a href='http://feeder.co/support' target=_blank>support</a>")
}