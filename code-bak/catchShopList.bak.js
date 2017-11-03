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
        console.log("JSON.stringify(my_shop_prod_list),length: " + my_shop_prod_list.length);
    },
    onLoadError: function(Casper, msg, Array_backtrace) {

    },
    onPageInitialized: function(pageobj) {},
    onTimeout: function(timeout_var) {
        //通知超时
    },
    waitTimeout: 1000 * 60, // 60s  for wait* family functions.
    exitOnError: true
});
var args = casper.cli.args;
//console.log(args.length);
if (args.length >= 1) { // ("http://")>=0 || args2.indexOf("https://")>=0){
    var url = args[0];
    shop_url = url;
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
//打开链接
casper.thenOpen(shop_url, function() {
    if (this.exists('.goods-list')) {
        this.echo('found   ', 'INFO');
        casper.captureSelector('found.png', 'html'); //截图
    } else {
        this.echo('  not found', 'ERROR');
        var postData = {};
        casper.captureSelector("not found", 'html');
        var isClose = this.fetchText(".empty-tip .text");
        console.log(isClose);
        if (isClose.indexOf("没有找到相关档口") != -1) {
            postData.seller_name = store_name;
            casper.open("http://localhost:3000/closeStore", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                encoding: 'utf8',
                data: postData
            });
            casper.captureSelector('not_found.png', 'html'); //截图
        }

        casper.wait(2000, function() {
            casper.die();
        })
    }
})
casper.waitForText("后一页", function() { //目前在第一页
        casper.echo("next page exists!");
        casper.captureSelector('firstPage.png', 'html'); //截图

    }, function() {
        //没有找到后一页这个文字
        casper.die();
    })
    .then(function() {
        this.wait(5500, function() {
            if (this.exists('.pagination .pager-jump span.pager-text')) {
                //提取总页数
                var allPage = this.fetchText('.pagination .pager-jump span.pager-text').replace(/[^0-9]/ig, "");
                //定义当前页数
                var indexPage = 1;
                this.echo("总页数：" + allPage);
            } else {
                console.log('not found page');
                casper.die();
            }
            //返回数据到本地数组
            var shop_list = casper.evaluate(function() {
                var item = docatch();
                return item;
            });
            //合并数据
            my_shop_prod_list = my_shop_prod_list.concat(shop_list);
            console.log("first: " + shop_list.length);
            clickNext();

            function clickNext() {
                //var inst =caspercasper_instance;
                if (allPage > indexPage) {
                    casper.wait(1000 * 3, function() {
                            casper.waitFor(function check() {
                                return this.evaluate(function() {
                                    return document.querySelectorAll('#content_all .pagination a').length > 1;
                                });
                            }, function then() {
                                casper.click('#content_all .pagination a.next');
                                indexPage++;
                            }, function timeout() { // step to execute if check has failed
                                this.echo("in the '" + indexPage + "' page is timeOut！");
                                this.echo("start in '" + indexPage + "' page agin");
                                casper.open(shop_url + "?&currentPage=" + indexPage)
                                    .then(function() {
                                        clickNext();
                                    })
                            });

                        })
                        .then(function() {
                            casper.wait(5000, function() {
                                casper.wait(1000, function() {
                                    casper.echo("The '" + indexPage + "' page is ok!");
                                    casper.captureSelector('nextShop.png', 'html');
                                });
                                var shop_list = casper.evaluate(function() {
                                    var item = docatch();
                                    return item;
                                });
                                //合并数据
                                my_shop_prod_list = my_shop_prod_list.concat(shop_list);
                                console.log("next page: " + my_shop_prod_list.length);
                                if (indexPage < allPage) {
                                    clickNext();
                                }
                            });

                        });
                }


            };
        });
    })
    .then(function() {
        //提交数据
        console.log('postting data ....');
        var post_obj = {};
        post_obj.shop_url = shop_tUrl;
        post_obj.vvic_url = shop_url;
        post_obj.product_list = my_shop_prod_list;
        casper.open(shop_prods, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            encoding: 'utf8',
            data: post_obj
        });
        casper.then(function() {
            console.log('data post ok ...')
        });
    })
casper.run();