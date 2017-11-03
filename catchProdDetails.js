var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
var seller_id = "8a2809344d8aa8d2014d8f6de0e44baf";

var my_shop_prod_list = {}; //数组存储店铺的商品 主要存储商品id 和 item_url

phantom.outputEncoding = "GBK"; //这里主要是防止乱码的出现

var casper = require("casper").create({
    pageSettings: { // 冒充浏览器
        userAgent: user_agent
    },
    viewportSize: {
        width: 1920,
        height: 1080
    },
    clientScripts: [
        // "https://cdn.bootcss.com/jquery/2.2.0/jquery.min.js"
        "jquery.min.js",
        "docatch.js"
    ],
    onDie: function(Casper, message, status) {
        console.log("onDie exit: " + message);
    },
    onLoadError: function(Casper, msg, Array_backtrace) {

    },
    onPageInitialized: function(pageobj) {
        //console.log("page inited!......");
    },
    waitTimeout: 1000 * 10, // 30s  for wait* family functions.
    exitOnError: true

});
// var mouse = require("mouse").create(casper);

var args = casper.cli.args;
//console.log(args.length);
if (args.length >= 1) { // ("http://")>=0 || args2.indexOf("https://")>=0){
    seller_id = args[0];
    console.log(seller_id);
    // proxy ="http://"+ args [1];
    //console.log ("proxy:"+proxy );
    // casper.pageSettings.proxy = proxy;
} else {
    console.log("casper.exit()");
    casper.exit();
    casper.die();
}

// /prodlist 参数是 seller_id



casper.start(); // 启动
casper.open("http://localhost:3000/prodlist", {
    method: 'post',

    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    encoding: 'utf8',

    data: {
        seller_id: seller_id
    }
});
var itemList_url = new Array();
var timeoutNum = 1; //尝试次数
console.log("start....");

casper.then(function() {
    console.log("获取空商品...");
    casper.open("http://localhost:3000/getNullProd?seller_id=" + seller_id, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        encoding: 'utf8'
    })

    .then(function() {
        var catchAngin = JSON.parse(this.getPageContent());
        console.log(catchAngin.length);
        if (catchAngin.length > 0) {
            var temp = new Array();
            for (var i = 0; i < catchAngin.length; i++) {
                temp.push(catchAngin[i]['tb_real_url']);
            }
            casper.then(function() {

                try {
                    catchDetails(temp);

                } catch (err) {
                    console.log(err);
                    return;
                }


            })
        } else {
            console.log("not have null product");
            casper.die();
        }
    })

})



casper.run(function() {
    this.echo('details is catched!');
    this.exit(); // <--- don't forget me!
});

function catchDetails(temp) {
    casper.start().each(temp, function(self, link) {
        self.thenOpen(link, function() {
            console.log(link);
            var canBuy = this.fetchText('.product-intro .btns .btn.btn_red');
            var item_prod = {};
            var isNone = this.fetchText('.sold-info');
            var isErr = this.fetchText('.product-intro');
            //console.log(isErr);
            if (isNone.indexOf("下架") != -1) {
                console.log("该商品已下架");
                return;
            }
            if (isErr.indexOf("错误") != -1) {
                console.log("该商品参数错误！");
                return;
            }
            //console.log(link);
            casper.waitForText("加入购物车", function then() {
                this.scrollToBottom();
                casper.waitFor(function check() {
                    return this.evaluate(function() {
                        return document.querySelectorAll('.desc-content img').length > 0;
                    });
                }, function then() {
                    item_prod = casper.evaluate(function() {
                        return docatchDetails_vv();
                    });
                    casper.then(function() {
                        //this.captureSelector('VVIC_details.png', 'html'); //截图
                        //console.log(item_prod);
                        item_prod.push(seller_id);
                        casper.wait(1000 * 2, function() {
                            //console.log(item_prod[0]['product_id']);
                            //等待3S 获取成功
                            //console.log("json:" + JSON.stringify(item_prod));
                            casper.open("http://localhost:3000/prod/item", {
                                method: 'post',
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8'
                                },
                                encoding: 'utf8',
                                data: item_prod
                            });
                        })
                    });
                }, function timeout() { // step to execute if check has failed
                    item_prod = casper.evaluate(function() {
                        return docatchDetails_vv();
                    });
                    casper.then(function() {
                        //this.captureSelector('VVIC_details.png', 'html'); //截图
                        //console.log(item_prod);
                        item_prod.push(seller_id);
                        casper.wait(1000 * 2, function() {
                            //console.log(item_prod[0]['product_id']);
                            //等待3S 获取成功
                            //console.log("json:" + JSON.stringify(item_prod));
                            casper.open("http://localhost:3000/prod/item", {
                                method: 'post',
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8'
                                },
                                encoding: 'utf8',
                                data: item_prod
                            });
                        })
                    });
                });
            }, function timeout() {
                console.log(link);
                anginOnce(link, item_prod);
            }, 30000)
        })
    })
}


//打开异常重新尝试
function anginOnce(link, item_prod) {
    // console.log(link + "   尝试次数" + timeoutNum);
    // casper.captureSelector('VVIC_details.png', 'html'); //截图
    casper.thenOpen(link, function() {
        casper.waitForText("加入购物车", function then() {
            this.scrollToBottom();
            casper.waitFor(function check() {
                return this.evaluate(function() {
                    return document.querySelectorAll('.desc-content img').length > 0;
                });
            }, function then() {
                item_prod = casper.evaluate(function() {
                    return docatchDetails_vv();
                });
                casper.then(function() {
                    //this.captureSelector('VVIC_details.png', 'html'); //截图
                    //console.log(item_prod);
                    item_prod.push(seller_id);
                    casper.wait(1000 * 2, function() {
                        //console.log(item_prod[0]['product_id']);
                        //等待3S 获取成功
                        //console.log("json:" + JSON.stringify(item_prod));
                        casper.open("http://localhost:3000/prod/item", {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            encoding: 'utf8',
                            data: item_prod
                        });
                    })
                });
            }, function timeout() { // step to execute if check has failed
                item_prod = casper.evaluate(function() {
                    return docatchDetails_vv();
                });
                casper.then(function() {
                    //this.captureSelector('VVIC_details.png', 'html'); //截图
                    //console.log(item_prod);
                    item_prod.push(seller_id);
                    casper.wait(1000 * 2, function() {
                        //console.log(item_prod[0]['product_id']);
                        //等待3S 获取成功
                        //console.log("json:" + JSON.stringify(item_prod));
                        casper.open("http://localhost:3000/prod/item", {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            encoding: 'utf8',
                            data: item_prod
                        });
                    })
                });
            });
        }, function timeout() {
            console.log("timeout!");
            return;
        }, 30000)
    })

}