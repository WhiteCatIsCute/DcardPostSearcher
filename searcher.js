//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               佛祖保佑         永無BUG
//
//
//

var api = 'https://www.dcard.tw/_api';
var titleNode = document.getElementById('titleInput');
var contentNode = document.getElementById('contentInput');
var schoolNode = document.getElementById('schoolInput');
var departmentNode = document.getElementById('departmentInput');
var forumNode = document.getElementsByTagName('select')[0];
var depthNode = document.getElementById('searchDepth');
var submitNode = document.getElementById('submitButton');
var clearNode = document.getElementById('clearButton');
var resultNode = document.getElementById('result');
var showContentNode = document.getElementById('showContent');

function keypressEnterSearch(key) {
    if (key.which == 13 || key.keyCode == 13) {
        searchPosts(titleNode.value, contentNode.value, schoolNode.value, departmentNode.value, forumNode.value, false);
        return false;
    }
}

titleNode.onkeypress = function(event) {
    keypressEnterSearch(event);
}

contentNode.onkeypress = function(event) {
    keypressEnterSearch(event);
}

schoolNode.onkeypress = function(event) {
    keypressEnterSearch(event);
}

departmentNode.onkeypress = function(event) {
    keypressEnterSearch(event);
}

depthNode.onkeypress = function(event) {
    keypressEnterSearch(event);
}

submitNode.onclick = function() {
    searchPosts(titleNode.value, contentNode.value, schoolNode.value, departmentNode.value, forumNode.value, false);
}

clearNode.onclick = function() {
    resultNode.innerHTML = '';
}

function ISO8601ToLocalDate(isostr) {
    var t = new Date(isostr),
        tzo = -t.getTimezoneOffset(),
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return t.getFullYear()
        + '-' + pad(t.getMonth()+1)
        + '-' + pad(t.getDate())
        + ' ' + pad(t.getHours())
        + ':' + pad(t.getMinutes())
        + ':' + pad(t.getSeconds());
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getForumPosts(forumName, isPopular, afterId, beforeId) {
    var forumPostApi = api + '/forums/' + forumName + '/posts?limit=100&popular=' + isPopular;
    if (contentNode.value !== '' || showContentNode.checked) {
        forumPostApi += '&content=full';
    }
    if (afterId != null) {
        forumPostApi += '&after=' + afterId;
    } else if (beforeId != null) {
        forumPostApi += '&before=' + beforeId;
    }
    return httpGet(forumPostApi);
}

var resultHTML = '';
var resultCt = 0;

function printSearchPosts(postJson, titleSubstr, contentSubstr, school, department, forum) {
    for (var i = 0; i < postJson.length; i++) {
        if ((school === '' || (!postJson[i]['anonymousSchool'] && postJson[i]['school'].indexOf(school) > -1)) && (department === '' || (!postJson[i]['anonymousDepartment'] && postJson[i]['department'].indexOf(department) > -1)) && (titleSubstr === '' || postJson[i]['title'].indexOf(titleSubstr) > -1) && (contentSubstr === '' || postJson[i]['content'].indexOf(contentSubstr) > -1)) {
            resultCt++;
            resultHTML += '<div><p>文章ID：<a target="_blank" href="https://www.dcard.tw/f/all/p/' + postJson[i]['id'] + '">' + postJson[i]['id'] + '</a></p>';
            if (forum === '..') {
                resultHTML += '<p>看板：' + postJson[i]['forumName'] + '</p>'
            }
            resultHTML += '<p>標題：<a target="_blank" href="https://www.dcard.tw/f/all/p/' + postJson[i]['id'] + '">' + postJson[i]['title'] + '</a></p><p>內文：</p>';
            if (showContentNode.checked) {
                resultHTML += '<pre>' + postJson[i]['content'] + '</pre>';
            } else {
                resultHTML += '<pre>' + postJson[i]['excerpt'] + '</pre>';
            }
            resultHTML += '<p>發文者：';
            if (!postJson[i]['anonymousSchool']) {
                resultHTML += postJson[i]['school'];
                if (!postJson[i]['anonymousDepartment']) {
                    resultHTML += ' ' + postJson[i]['department'];
                }
                resultHTML += '</p>';
            } else {
                resultHTML += '匿名</p>';
            }
            resultHTML += '<p>性別：' + postJson[i]['gender'] + '　愛心數：' + postJson[i]['likeCount'] + '　留言數：' + postJson[i]['commentCount'] + '</p><p>發文時間：' + ISO8601ToLocalDate(postJson[i]['createdAt']) + '</p></div><hr>';
        }
    }
}

var req;
var postJson;

function searchPosts(titleSubstr, contentSubstr, school, department, forum, isNext) {
    resultHTML = '';
    resultCt = 0;
    if (isNext) {
        req = getForumPosts(forum, false, null, postJson[postJson.length - 1]['id']);
    } else {
        req = getForumPosts(forum, false, null, null);
    }
    postJson = JSON.parse(req);
    printSearchPosts(postJson, titleSubstr, contentSubstr, school, department, forum);
    for (var i = 0; i < depthNode.value - 1; i++) {
        if (postJson.length === 0) {
            break;
        }
        req = getForumPosts(forum, false, null, postJson[postJson.length - 1]['id']);
        postJson = JSON.parse(req);
        printSearchPosts(postJson, titleSubstr, contentSubstr, school, department, forum);
    }
    if (!isNext)
        resultNode.innerHTML = '';
    resultNode.innerHTML += '<h2>搜尋結果</h2><h3>' + resultCt + '個結果</h3><hr>' + resultHTML + '<input type="submit" id="nextSubmitButton" value="繼續搜尋">';
    document.getElementById("nextSubmitButton").onclick = function () {
        this.remove();
        searchPosts(titleNode.value, contentNode.value, schoolNode.value, departmentNode.value, forumNode.value, true);
    }
}
