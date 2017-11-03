const readline = require('readline');
const http = require('http');
const querystring = require('querystring');
const child = require('child_process');

var cmd = 'casperjs';
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
            getShop(line.trim())
            break;
    }
    rl.prompt();
})
rl.on('close', function() {
    console.log("退出");
    process.exit(0);
});
var options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/sellerName',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
};



function getShop(seller_name) {
    var data = querystring.stringify({
        seller_name: seller_name
    })
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chun) {
            console.log(chun);
            start_child('child_process_test.js', chun)
        })
    });
    req.on('error', function(err) {
        console.log(err);
    });
    req.write(data);
    req.end();
}

function start_child(script, param) {
    var child_cmd = cmd + " " + script + " " + '"' + param + '"';
    console.log(child_cmd);
    const sub_proc = child.exec(child_cmd, function(e, stdout, stderr) {
        if (!e) {
            console.log(stdout);
            console.log(stderr);
        }
    })
    sub_proc.on('close', function() {
        console.log("ok");
    })
}