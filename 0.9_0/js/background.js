var connected = 0;
var categories = [];
var news = [];
var breakingNews = [];
var live = [];

$(function(){
    chrome.browserAction.setBadgeBackgroundColor({color: '#00C000'});
    chrome.extension.onConnect.addListener(function(port){
        connected = 1;
        port.onDisconnect.addListener(function(port){
            connected = 0;
            checkNews();
        });
        port.postMessage({
            news: news,
            breakingNews: breakingNews,
            live: live,
            categories: categories
        });
    });

    checkNews();
    setInterval('checkNews()', 60000);
});

function checkNews() {
    if (connected) return;
    var count = 0;

    var url = 'http://rt.com/api/news/';
    if (localStorage['sections']) {
        url += 'categories/' + localStorage['sections'] + '/';
    }

    $.ajax({
        url: url,
        type: 'GET',
        //data: {'categories': localStorage['sections']},
        dataType: 'json',
        success: function(data){
            if (localStorage['lasttime']) {
                breakingNews = data.breakingNews;

                var isbreaking = 0;
                for (var i = 0; i < data.news.length; i ++) {
                    if (data.news[i].date > localStorage['lasttime']) {
                        count ++;
                        if (breakingNews.length > 0 && breakingNews[0].url == data.news[i].url) {
                            isbreaking = 1;
                        }
                    }
                }

                if (isbreaking) {
                    chrome.browserAction.setBadgeBackgroundColor({color: '#FF0000'});
                } else {
                    chrome.browserAction.setBadgeBackgroundColor({color: '#00C000'});
                }

                if (count > 0) {
                    chrome.browserAction.setBadgeText({text: "" + count});
                } else {
                    chrome.browserAction.setBadgeText({text: ""});
                }

            } else {
                chrome.browserAction.setBadgeText({text: ""});
            }
            news = data.news;

            live = data.live;

            categories = data.categories;
        },
    });

}
