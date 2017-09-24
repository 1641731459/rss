var categories = {};
var catArray = [];
var news = [];
var breakingNews = [];
var live = [];
var position = 0;
var drawed = 0;
var time;
var mtop = '0px';
var isnews = 0;
var isbreaking = 0;
var lock = 0;
var bheight = 0;

$(function(){
    chrome.browserAction.setBadgeText({text: ""});

    var port = chrome.extension.connect();
    port.onMessage.addListener(function(obj){
        news = obj.news;
        breakingNews = obj.breakingNews;
        live = obj.live;
        catArray = obj.categories;
        if (news.length) {
            lock = 1;
            isnews = 1;
            showBreakingNews();
            showLive();
            showSections();
        } else {
            loadContent();
        }
    });

    $('.gear').click(function() {
        showSettings();
    });

    $('.newscont').mousewheel(function(event, delta) {
        newsscroll(delta);
    });

    $('body').keydown(function(e){
        if (e.keyCode == 9) {
            return false;
        }
    });

    //loadContent();
});

function showSections() {
    $('.settings_categories').html('');
    for (var i = 0; i < catArray.length; i ++) {
        var p = $('<p/>').appendTo('.settings_categories');
        var input = $('<input/>').attr('type', 'checkbox').attr('name', 'section').attr('id', 'check' + catArray[i].id).addClass('check_section').attr('value', catArray[i].id).appendTo(p);
        var label = $('<label/>').attr('for', 'check' + catArray[i].id).html(catArray[i].name).appendTo(p);
    }
}

function showSettings() {
    $('.check_section').prop('checked', false);

    if (localStorage['sections']) {
        var sections = localStorage['sections'].split(',');
        for (var i = 0; i < sections.length; i ++) {
            $('#check' + sections[i]).prop('checked', true);
        }
        if (sections.length == $('.check_section').length - 1) {
            $('#check0').prop('checked', true);
        }
    } else {
        $('.check_section').prop('checked', true);
    }

    $('#check0').change(function() {
        if ($('#check0').prop('checked')) {
            $('.check_section').prop('checked', true);
        } else {
            $('.check_section').prop('checked', false);
        }
    });

    $('.check_section').change(function() {
        var count = 0;
        $('.check_section:checked').each(function() {
            if($(this).attr('value') != 0) count ++;
        });
        if (count == $('.check_section').length - 1) {
            $('#check0').prop('checked', true);
        } else {
            $('#check0').prop('checked', false);
        }
    });

    $('.save_settings').click(function() {
        saveSettings();
    });

    $('.content').animate({'margin-left': '-380px'}, 500);
}

function saveSettings() {
    var oldsections = localStorage['sections'];
    var sections = '';
    $('.check_section:checked').each(function() {
        if ($(this).attr('value') != 0) {
            if (sections) sections += ',';
            sections += $(this).attr('value');
        }
    });

    if (oldsections != sections) {
        localStorage['sections'] = sections;
        loadContent();
    }

    $('.content').animate({'margin-left': '0'}, 500);
}

function loadContent() {
    lock = 1;
    isnews = 0;
    isbreaking = 0;

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
            breakingNews = data.breakingNews;
            news = data.news;
            live = data.live;
            catArray = data.categories;
            isnews = 1;
            $('.newslist').html('');

            showBreakingNews();
            showLive();
            showSections();
        },
    });
}

function newsscroll(delta) {
    if (lock || $('.newslist').css('margin-top') != mtop) return true;

    var oldposition = position;
    if (delta > 0) {
        //up
        if (position > 0){
            position --;
        } else {
            return true;
        }
    } else {
        //down
        if ((position + 1) * 5 < news.length) {
            if (drawed < position + 2) drawNews(position + 1);
            position ++;
        } else {
            return true;
        }
    }

    var i = 0;
    var h = 0;
    $('.newslist ul').each(function(){
        if (position == i) {
            $('.newscont').height($(this).height());
            $('.newslist').animate({'margin-top': (-h) + 'px'}, 500);
            mtop = (-h) + 'px';

            $('.runner').remove();
            $('<div/>').addClass('runner').prependTo($('.newscont'));
            $('.runner').height(bheight);
            $('.runner').css('top', (oldposition * bheight) + 'px');
            $('.runner').css('opacity', 1);
            $('.runner').animate({'top': (position * bheight) + 'px'}, 500);
            $('.runner').animate({'opacity': 0}, 1000);
        }
        h += $(this).height() + 3;
        i ++;
    });
}

function drawNews(part) {
    var ul = $('<ul/>').appendTo('.newslist');
    for (var i = part * 5; i < part * 5 + 5 && i < news.length; i ++) {
        var timenews = time - news[i].date;
        if (timenews < 60) {
            timenews = 'less than 1 minute ago';
        } else if (timenews < 120) {
            timenews = '1 minute ago';
        } else if (timenews < 3600) {
            timenews = Math.round(timenews / 60) + ' minutes ago';
        } else if (timenews < 7200) {
            timenews = '1 hour ago';
        } else if (timenews < 3600 * 24) {
            timenews = Math.round(timenews / 3600) + ' hours ago';
        } else {
            var date = new Date(news[i].date * 1000);
            timenews = $.format.date(date, 'dd.MM.yyyy');
        }

        var li = $('<li/>').appendTo(ul);
        var a = $('<a/>').attr('href', news[i].url + '?utm_source=browser&utm_medium=aplication_chrome&utm_campaign=chrome').attr('target', '_blank').appendTo(li);
        var img = $('<img/>').attr('src', news[i].image).appendTo(a);
        var b = $('<b/>').html(news[i].name).appendTo(a);
        var span = $('<span/>').html(categories[news[i].category] + ' &middot; ' + timenews).appendTo(a);
    }
    if (drawed < part + 1) drawed = part + 1;
}

function showNews() {
    if (!isbreaking || !isnews) return;

    for (var i = 0; i < catArray.length; i ++) {
        categories[catArray[i].id] = catArray[i].name;
    }

    time = Math.round((new Date()).getTime() / 1000);
    localStorage['lasttime'] = time;
    if (news.length > 0 && news[0].date) localStorage['lasttime'] = news[0].date;
    $('.newslist').html('');
    for (var i = 0; i < news.length; i ++) {
        if (breakingNews.length > 0 && breakingNews[0].url == news[i].url) {
            news.splice(i,1);
            break;
        }
    }
    position = 0;
    drawed = 0;
    mtop = '0px';

    bheight = 407 / parseInt((news.length + 4) / 5);
    $('<div/>').addClass('runner').prependTo($('.newscont'));
    $('.runner').height(bheight);
    $('.runner').css('top', 0);
    $('.runner').css('opacity', 1);
    $('.runner').animate({'opacity': 0}, 1000);

    $('.newslist').css('margin-top', 0);
    drawNews(0);
    $('.newscont').height($('.newslist ul:first').height());
    lock = 0;
}

function showBreakingNews() {
    if (breakingNews.length > 0 && breakingNews[0].name) {
        $('.breakingnews a').attr('href', breakingNews[0].url);
        $('.breakingnews span').html(breakingNews[0].name);
        var img = breakingNews[0].image;
        if (img) {
            $('.breakingnews span').css('display', 'block');
            $('.breakingnews img').attr('src', img);
            $('.breakingnews img').show();
        } else {
            $('.breakingnews span').css('display', 'inline');
            $('.breakingnews img').hide();
        }
        $('.breakingnews').show();
    } else {
        $('.breakingnews').hide();
    }
    isbreaking = 1;
    showNews();
    console.log("sunxiaoyu");
    console.log('xiaoxixixoxoixiciicicicicicicicicii`');
}

function showLive() {
    if (breakingNews.length > 0 && breakingNews[0].name) return;
    if (live.length && live[0].name) {
        $('.liveevent a').attr('href', live[0].url);
        $('.liveevent .text').html(live[0].name);
        $('.liveevent').show();
    } else {
        $('.liveevent').hide();
    }
}
