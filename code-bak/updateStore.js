const readline = require('readline');
const http = require('http');
const querystring = require('querystring');
const child = require('child_process');
const iconv = require('iconv-lite');
var cmd = "casperjs  ";
//创建readline接口实例
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
console.log("-------------输入exit退出当前程序------------");
console.log("请输入要查找的店铺名:");

rl.setPrompt('');
//输入
rl.on('line', function(line) {
    switch (line.trim()) {
        case 'exit':
            rl.close();
            break;
        default:
            getShop(line.trim());
            break;
    }
    rl.prompt();
})


function getShop(seller_name) {
    var data = querystring.stringify({
        seller_name: seller_name
    })
    var options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/sellerName',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chun) {
            var chun = JSON.parse(chun);
            console.log(chun);
            var store_name = chun[0]['store_name'];
            var taobao_url = chun[0]['taobao_url'];
            var seller_id = chun[0]['seller_id'];
            console.log(taobao_url);
            console.log("进行更新...");
            updateVVIC(taobao_url, seller_id, store_name);

        })
    });
    req.on('error', function(err) {
        console.log(err);
    });
    req.write(data);
    req.end();
}

function updateVVIC(taobao_url, seller_id, store_name) {
    start_casper("getStoreName.js", store_name, taobao_url, seller_id)
}

function start_casper(script, store_name, taobao_url, seller_id) {
    var chirld_cmd = cmd + " " + script + '  "' + store_name + ' ' + taobao_url + '"';
    var child_cmd2 = cmd + 'catchProdDetails.js "' + seller_id + '"';
    console.log(chirld_cmd);
    console.log(child_cmd2);
    const catch_list = child.exec(chirld_cmd, { encoding: 'buffer' }, function(e, stdout, stderr) {　
        if (!e) {　　
            stdout = iconv.decode(stdout, 'gbk');　　
            console.log(stdout);　　　　
            console.log(stderr);　
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
            }
        });
        catch_details.on('close', function() {
            console.log("该店铺爬取完成...");
            console.log("请输入要查找的店铺名:");
        })

    })
}