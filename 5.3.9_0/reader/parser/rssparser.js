var FeederRSSParser = FeedParser.extend({
	initialize: function(feed) {
		this._super(feed);
		this.parser = new RSSParser({path: feed.path});
	},

	setResult: function(xml, text, callback) {
		rssLog("Parsing", this.path);
		this.parser.setResult(text, callback);
	},

	parse: function(callback) {
		chain(this.parser.parse)
		.andSync(this.setDataFromParser)
		.andSync(this.logErrors)
		.end(callback, this);
	},

	setDataFromParser: function() {
		this.data = this.parser.data;
		this.data.path = this.path;
		this.data.guid = this.path;
		this.error = this.parser.error;
		this.posts = this.parser.posts;
	},

	logErrors: function() {
		if (this.error) {
			rssLog("Error parsing", this.feed.path, this.parser.errorMessage);
		} else {
			rssLog("Completed parsing", this.feed.path);
		}
	}
});

function rssLog() {
	console.log.apply(console, arguments);
}