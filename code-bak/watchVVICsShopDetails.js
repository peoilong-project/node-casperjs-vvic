var http = require('http');
var querystring = require('querystring');
var child = require('child_process');
const iconv = require('iconv-lite');
var cmd = "casperjs  ";


function GetOneShop(cbk) {

    HttpGet(cbk);
};
var index = -1;

function HttpGet(cbk) {
    index = index + 1;
    var store_url = '/vvicStore?index=' + index;
    var options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: store_url,
        method: 'GET'
    };
    console.log(store_url);
    console.log(index);
    //发送请求 
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            var task_objs = JSON.parse(chunk); //如果服务器传来的是json字符串，可以将字符串转换成json [{"seller_id":"8a2809344d2d9d01014d319cd1be3494","taobao_url":"http://shop111605059.taobao.com/search.htm?spm=a1z10.3-c.w4002-8238872939.28.rwrmck&mid=w-8238872939-0&search=y&pageNo=","last_fetch_time":"2015-07-24T02:45:45.000Z"}]
            if (task_objs && task_objs.length > 0) {
                var task = task_objs[0];
                index + 1;
                cbk(task); //回调任务
            }
        });
    });

    //如果有错误会输出错误
    req.on('error', function(e) {
        console.log('错误：' + e.message);
    });
    req.end();
}

{
    console.log("running");
    GetOneShop(function(task) {
        var seller_id = task.seller_id;
        console.log("seller_id:" + seller_id);
        start_casper("clickShopDetails.js", seller_id);
    });
}

var timer = setInterval(function() {
    console.log("running");
    GetOneShop(function(task) {
        var seller_id = task.seller_id;
        console.log("seller_id:" + seller_id);
        start_casper("clickShopDetails.js", seller_id);
    });
}, 1000 * 60 * 2); //6 分钟启动一个店铺

function start_casper(script, vvic_url, shop_url) {
    var chirld_cmd = cmd + " " + script + '  "' + vvic_url + ' ' + shop_url + '"';
    console.log(chirld_cmd);
    const sub_proc = child.exec(chirld_cmd, { encoding: 'buffer' }, function(e, stdout, stderr) {　
        if (!e) {　　
            stdout = iconv.decode(stdout, 'gbk');　　
            console.log(stdout);　　　　
            console.log(stderr);　　
        }
    });
}