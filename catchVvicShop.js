var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
//搜款网店铺url
var shop_url = "http://www.vvic.com/shop/20262";
//ec_seller_store_info中对应店铺的字段：taobao_url
var shop_tUrl = "http://shop59185514.taobao.com/search.htm?spm=a1z10.3-c.w4002-1552201348.36.lLDbte&mid=w-1552201348-0&search=y&v=1&pageNo=";

var shop_prods = "http://localhost:3000/shop/prods";
var my_shop_prod_list = new Array(); //数组存储店铺的所有商品
var my_shop_prod_details = new Array(); //数组存储店铺的商品详情
phantom.outputEncoding = "gbk"; //这里主要是防止乱码的出现

//实例化casper
var casper = require("casper").create({
    pageSettings: {
        //冒充浏览器标识
        userAgent: user_agent
    },
    viewportSize: {
        width: 1920,
        heght: 1080
    },
    clientScripts: [
        "jquery.min.js",
        "docatch.js"
    ],
    onDie: function(Casper, message, status) {
        console.log("onDie exit: " + message);
    },
    onLoadError: function(Casper, msg, Array_backtrace) {

    },
    onPageInitialized: function(pageobj) {},
    onTimeout: function(timeout_var) {
        //通知超时
    },
    waitTimeout: 1000 * 30, // 60s  for wait* family functions.
    exitOnError: true
});
var args = casper.cli.args;
//console.log(args.length);
if (args.length >= 1) { // ("http://")>=0 || args2.indexOf("https://")>=0){
    var url = args[0];
    shop_url = url + '?&merge=1';
    shop_tUrl = args[1];
    console.log(shop_url);
    console.log(shop_tUrl);
    // proxy ="http://"+ args [1];
    //console.log ("proxy:"+proxy );
    // casper.pageSettings.proxy = proxy;
} else {
    console.log("casper.exit()");
    casper.exit();
    casper.die();
}

//启动
casper.start();
console.log("start");
//创建鼠标对象
//var mouse = require("mouse").create(casper);
// console.log("mouse");
//
var indexPage = 1;
var allPage;
var tryNum = 0;
casper.thenOpen(shop_url, function() {
    casper.waitFor(function check() {
        return this.evaluate(function() {
            return document.querySelectorAll('#content_all .pagination span').length > 1;
        });
    }, function then() { // step to execute when check() is ok
        //this.captureSelector('yoursitelist.png', '#content_all .pagination span.pager-text');
        this.wait(2000, function() {
            //提取总页数
            allPage = this.fetchText('.pagination .pager-jump span.pager-text').replace(/[^0-9]/ig, "");
            //定义当前页数
            this.echo("总页数：" + allPage);
            //获取第一页数据
            var shop_list = casper.evaluate(function() {
                var item = docatch();
                return item;
            });
            console.log("第" + indexPage + '页' + shop_list.length);
            indexPage++;
            //合并数据
            my_shop_prod_list = my_shop_prod_list.concat(shop_list);
            var item_url = new Array();
            if (allPage >= 2) {
                for (var i = 2; i <= allPage; i++) {
                    item_url.push(shop_url + '&currentPage=' + i);
                }
                console.log(item_url);

                casper.start().each(item_url, function(self, link) {
                    tryNum = 0;
                    self.thenOpen(link, function() {
                        casper.wait(2000, function() {
                            casper.waitFor(function check() {
                                return this.evaluate(function() {
                                    return document.querySelectorAll('#content_all .pagination span').length > 1;
                                });
                            }, function then() {
                                //返回数据到本地数组
                                var shop_list = casper.evaluate(function() {
                                    var item = docatch();
                                    return item;
                                });
                                console.log("第" + indexPage + '页' + shop_list.length);
                                indexPage++;
                                //合并数据
                                my_shop_prod_list = my_shop_prod_list.concat(shop_list);
                            }, function timeout() {
                                //
                                tryNum++;
                                console.log(link);
                                tryAngin_next(link, function() {
                                    console.log(" try angin:" + tryNum);
                                })
                            })
                        })

                    })
                });
            }

            casper.then(function() {
                console.log("all: " + my_shop_prod_list.length);
                //提交数据
                console.log('postting data ....');
                var post_obj = {};
                post_obj.shop_url = shop_tUrl;
                post_obj.vvic_url = shop_url;
                post_obj.product_list = my_shop_prod_list;
                // for (var i = 0; i < post_obj.product_list.length; i++) {
                //     console.log(post_obj.product_list[i]['p_name']);
                // }
                //console.log(post_obj.product_list.p_name);
                casper.open(shop_prods, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    encoding: 'utf8',
                    data: post_obj
                });
            })
        });
    }, function timeout() { // step to execute if check has failed
        tryNum++;
        console.log("father");
        tryAngin_index(shop_url, function() {
            console.log("index is trying angin...");
        })
    });

});
casper.run();

//打开vvic店铺首页异常
function tryAngin_index(shop_url, callback) {
    casper.thenOpen(shop_url, function() {
        casper.waitFor(function check() {
            return this.evaluate(function() {
                return document.querySelectorAll('#content_all .pagination span').length > 1;
            });
        }, function then() { // step to execute when check() is ok
            this.captureSelector('yoursitelist.png', '#content_all .pagination span.pager-text');
            this.wait(2000, function() {
                //提取总页数
                allPage = this.fetchText('.pagination .pager-jump span.pager-text').replace(/[^0-9]/ig, "");
                //定义当前页数
                this.echo("总页数：" + allPage);
                //获取第一页数据
                var shop_list = casper.evaluate(function() {
                    var item = docatch();
                    return item;
                });
                console.log("第" + indexPage + '页' + shop_list.length);
                indexPage++;
                //合并数据
                my_shop_prod_list = my_shop_prod_list.concat(shop_list);
                var item_url = new Array();
                if (allPage >= 2) {
                    for (var i = 2; i <= allPage; i++) {
                        item_url.push(shop_url + '&currentPage=' + i);
                    }
                    console.log(item_url);
                    tryNum = 0;
                    casper.start().each(item_url, function(self, link) {
                        self.thenOpen(link, function() {

                            casper.waitFor(function check() {
                                return this.evaluate(function() {
                                    this.scrollToBottom();
                                    return document.querySelectorAll('#content_all .pagination span').length > 1;
                                });
                            }, function then() {
                                casper.wait(2000, function() {
                                    //返回数据到本地数组
                                    var shop_list = casper.evaluate(function() {
                                        var item = docatch();
                                        return item;
                                    });
                                    console.log("第" + indexPage + '页' + shop_list.length);
                                    indexPage++;
                                    //合并数据
                                    my_shop_prod_list = my_shop_prod_list.concat(shop_list);
                                    return;
                                })
                            }, function timeout() {
                                //
                                tryNum++;
                                console.log(link);
                                tryAngin_next(link, function() {
                                    console.log(" try angin:" + tryNum);
                                })
                            })


                        })
                    });
                }

                casper.then(function() {
                    console.log("all: " + my_shop_prod_list.length);
                    //提交数据
                    console.log('postting data 2222222222222222222....');
                    var post_obj = {};
                    post_obj.shop_url = shop_tUrl;
                    post_obj.vvic_url = shop_url;
                    post_obj.product_list = my_shop_prod_list;
                    // for (var i = 0; i < post_obj.product_list.length; i++) {
                    //     console.log(post_obj.product_list[i]['p_name']);
                    // }
                    // //console.log(post_obj.product_list.p_name);
                    casper.open(shop_prods, {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        encoding: 'utf8',
                        data: post_obj
                    });
                })
            });
        }, function timeout() { // step to execute if check has failed
            if (tryNum < 3) {
                tryNum++;
                console.log("子循环");
                tryAngin_index(shop_url, function() {
                    console.log(" try angin:" + tryNum);
                })
            } else {
                console.log("err: end");
                casper.die();
            }
        });
    })
    callback();
}
//翻页异常
function tryAngin_next(link, callback) {
    casper.thenOpen(link, function() {
        casper.waitFor(function check() {
            return this.evaluate(function() {
                return document.querySelectorAll('#content_all .pagination span').length > 1;
            });
        }, function then() {
            tryNum = 0;
            casper.wait(2000, function() {
                //返回数据到本地数组
                var shop_list = casper.evaluate(function() {
                    var item = docatch();
                    return item;
                });
                console.log("第" + indexPage + '页' + shop_list.length);
                indexPage++;
                //合并数据
                my_shop_prod_list = my_shop_prod_list.concat(shop_list);
            })

        }, function timeout() {
            //
            if (tryNum < 3) {
                tryNum++;
                console.log("子循环");
                tryAngin_next(link, function() {
                    console.log(" try angin:" + tryNum);
                })
            } else {
                tryNum = 0;
            }
        })
    })
    callback();
}