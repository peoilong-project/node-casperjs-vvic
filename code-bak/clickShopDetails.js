var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
var seller_id = "8a2809344cd6a534014cd6a6f5200003";

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
        "docatchDetails.js"
    ],
    onDie: function(Casper, message, status) {
        console.log("onDie exit: " + message);
    },
    onLoadError: function(Casper, msg, Array_backtrace) {

    },
    onPageInitialized: function(pageobj) {
        //console.log("page inited!......");
    },
    waitTimeout: 1000 * 60, // 30s  for wait* family functions.
    exitOnError: true

});
// var mouse = require("mouse").create(casper);

var args = casper.cli.args;
//console.log(args.length);
if (args.length >= 1) { // ("http://")>=0 || args2.indexOf("https://")>=0){
    var seller_id = args[0];
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
casper.then(function() {
    var ps = (this.getPageContent());
    my_shop_prod_list = JSON.parse(ps);
    console.log(my_shop_prod_list.length);
    if (my_shop_prod_list.length > 0) {
        for (var i = my_shop_prod_list.length - 1; i >= 0; i--) {
            //itemList_url.push(my_shop_prod_list[i]['tb_real_url']);
            //console.log(itemList_url);
            catchItem(my_shop_prod_list[i]);
        }
    } else {
        console.log("没有该店铺对应的商品....");
        casper.die();
    }
});

function catchItem(item) {
    casper.wait(1000 * 1, function() {
        // console.log(item.product_id);
        console.log(item.tb_real_url);
        var item_prod_vv = {};
        var item_prod = {};
        //console.log(item.tb_real_url);
        try {
            casper.open(item.tb_real_url)
                .then(function() {
                    if (item.tb_real_url.indexOf("taobao") >= 0) {
                        console.log("已经是淘宝链接!");
                        var isXianyu = "";
                        casper.waitFor(function check() {
                            isXianyu = casper.evaluate(function() {
                                return isXianyu();
                            });
                            if (isXianyu != null) {
                                return true;
                            }
                        }, function then() { // step to execute when check() is ok
                            if (isXianyu.indexOf("hellip") >= 0) {
                                console.log("该链接已跳转至闲鱼...........");
                                //console.log("不进行处理，执行下一个...........");
                                return false;
                            }
                            //此时进入第一页的页面
                            this.echo("taobao shop details is come !"); //看到 下一页 ，进入循环点击 每一产品列表页的过程
                            this.captureSelector('next_item.png', 'html'); //截图
                            casper.wait(2000, function() {
                                    //可以读取产品信息了
                                    console.log("开始分析淘宝详情页面.......");
                                    item_prod = casper.evaluate(function() {
                                        return docatchDetails_taobao();
                                    });
                                })
                                .then(function() {
                                    casper.wait(1000 * 2, function() {
                                        item_prod.product_id = item.product_id;
                                        console.log(item.product_id);
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
                            console.log("当前链接异常..." + item.tb_real_url);
                        })
                    } else {
                        console.log("vvic url");
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

                        casper.waitForText("加入购物车", function() {
                                //this.echo("taobao shop details is come !"); //看到 下一页 ，进入循环点击 每一产品列表页的过程
                                this.captureSelector('next_item.png', 'html'); //截图
                            })
                            .then(function() {
                                //可以读取产品信息了
                                console.log("开始分析VV页面.......");
                                item_prod_vv = casper.evaluate(function() {
                                    return docatchDetails_vv();
                                });

                                var p_taobaoLink = '';
                                if (item_prod_vv[0]['p_taobaoLink'].length < 1) {
                                    return
                                }
                                casper.wait(1000 * 2, function() {
                                        item_prod_vv.product_id = item.product_id;
                                        //等待3S 获取成功
                                        //console.log("json:" + JSON.stringify(item_prod_vv));
                                        p_taobaoLink = item_prod_vv[0]['p_taobaoLink'];
                                        console.log("跳转淘宝对应详情页..." + p_taobaoLink);

                                    })
                                    .then(function() {
                                        if (p_taobaoLink.indexOf('taobao') == -1) {
                                            return;
                                        }
                                        casper.open(p_taobaoLink);
                                        var isXianyu = "";
                                        casper.waitFor(function check() {
                                            isXianyu = casper.evaluate(function() {
                                                return isXianyu();
                                            });
                                            if (isXianyu != null) {
                                                return true;
                                            }
                                        }, function then() { // step to execute when check() is ok
                                            if (isXianyu.indexOf("hellip") >= 0) {
                                                console.log("该链接已跳转至闲鱼...........");
                                                //console.log("不进行处理，执行下一个...........");
                                                return false;
                                            }
                                            //此时进入第一页的页面
                                            //this.echo("taobao shop details is come !"); //看到 下一页 ，进入循环点击 每一产品列表页的过程
                                            this.captureSelector('next_item.png', 'html'); //截图
                                            casper.wait(2000, function() {
                                                    //可以读取产品信息了
                                                    console.log("开始分析淘宝详情页面.......");
                                                    item_prod = casper.evaluate(function() {
                                                        return docatchDetails_taobao();
                                                    });
                                                })
                                                .then(function() {
                                                    casper.wait(1000 * 2, function() {
                                                        console.log(item.product_id);
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
                                                        casper.wait(1000 * 1);
                                                    })
                                                })
                                        }, function timeout() { // step to execute if check has failed
                                            console.log("当前链接异常..." + p_taobaoLink);

                                        })
                                    })
                            });



                    }

                })


        } catch (err) {
            return;
        }
    });
}

casper.run(function() {
    this.echo('So the whole suite ended.');
    this.exit(); // <--- don't forget me!
});