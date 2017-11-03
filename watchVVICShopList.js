var http = require('http');
var querystring = require('querystring');
var child = require('child_process');
const iconv = require('iconv-lite');
var cmd = "casperjs  ";


function GetOneShop(cbk) {

    HttpGet(cbk);
};
var index = 4;

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
                console.log(task);
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
        var vvic_url = task.vvic_url;
        var taobao_url = task.taobao_url;
        var store_name = task.store_name;
        var seller_id = task.seller_id;
        console.log("获取店铺链接，进行更新...");
        updateVVIC(vvic_url, taobao_url, seller_id, store_name);
    });
}

function updateVVIC(vvic_url, taobao_url, seller_id, store_name) {
    start_casper("getStoreName.js", vvic_url, taobao_url, seller_id, store_name)
}

function start_casper(script, vvic_url, taobao_url, seller_id, store_name) {
    var chirld_cmd = cmd + " " + script + '  "' + store_name + ' ' + taobao_url + '"';
    var child_cmd2 = cmd + 'catchProdDetails.js "' + seller_id + '"';
    console.log(chirld_cmd);
    console.log(child_cmd2);
    const catch_list = child.exec(chirld_cmd, { encoding: 'buffer' }, function(e, stdout, stderr) {　
        if (!e) {　　
            stdout = iconv.decode(stdout, 'gbk');　　
            console.log(stdout);　　　　
            console.log(stderr);　
            catch_list_pid = `${catch_list.pid}`;　
            console.log(catch_list_pid);
        }
    });
    catch_list.on('close', function() {
        console.log('catch shoplist is ok!');
        console.log("running catch details...");
        const catch_details = child.exec(child_cmd2, { encoding: 'buffer' }, function(e, stdout, stderr) {　
            if (!e) {　　
                stdout = iconv.decode(stdout, 'gbk');　　
                console.log(stdout);　　　　
                console.log(stderr);　
                catch_details_pid = `${catch_details.pid}`;　
                console.log(catch_details_pid);
            }
        });
        catch_details.on('close', function() {
            GetOneShop(function(task) {
                var vvic_url = task.vvic_url;
                var taobao_url = task.taobao_url;
                var store_name = task.store_name;
                var seller_id = task.seller_id;
                console.log("获取店铺链接，进行更新...");
                updateVVIC(vvic_url, taobao_url, seller_id, store_name);
            });
        })

    })
}

function start_casper2(script, vvic_url, taobao_url, seller_id) {
    var chirld_cmd = cmd + " " + script + '  "' + vvic_url + ' ' + taobao_url + '"';
    var child_cmd2 = cmd + 'catchProdDetails.js "' + seller_id + '"';
    console.log(chirld_cmd);
    console.log(child_cmd2);
    const catch_list = child.exec(chirld_cmd, { encoding: 'buffer' }, function(e, stdout, stderr) {　
        if (!e) {　　
            stdout = iconv.decode(stdout, 'gbk');　　
            console.log(stdout);　　　　
            console.log(stderr);　
            catch_list_pid = `${catch_list.pid}`;　
            console.log(catch_list_pid);
        }
    });
    catch_list.on('close', function() {
        console.log('catch shoplist is ok!');
        console.log("running catch details...");
        const catch_details = child.exec(child_cmd2, { encoding: 'buffer' }, function(e, stdout, stderr) {　
            if (!e) {　　
                stdout = iconv.decode(stdout, 'gbk');　　
                console.log(stdout);　　　　
                console.log(stderr);　
                catch_details_pid = `${catch_details.pid}`;　
                console.log(catch_details_pid);
            }
        });
        catch_details.on('close', function() {
            GetOneShop(function(task) {
                var vvic_url = task.vvic_url;
                var taobao_url = task.taobao_url;
                var store_name = task.store_name;
                var seller_id = task.seller_id;
                if (vvic_url == null) {
                    console.log("获取店铺链接，进行更新...");
                    updateVVIC(vvic_url, taobao_url, seller_id, store_name);
                } else {
                    console.log("vvic_url:" + vvic_url);
                    var len = vvic_url.indexOf("vvic");
                    console.log(len);
                    if (len === -1) {
                        console.log("进行更新...");
                        updateVVIC(vvic_url, taobao_url, seller_id, store_name);
                    } else {
                        console.log("已存在vvic链接...");
                        start_casper2("catchProdDetails.js", vvic_url, taobao_url, seller_id);
                    }
                }
            });
        })

    })
}