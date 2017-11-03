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
    waitTimeout: 1000 * 40, // 40s  for wait* family functions.
    exitOnError: true

});
// var mouse = require("mouse").create(casper);

// var args = casper.cli.args;
// //console.log(args.length);
// if (args.length >= 1) { // ("http://")>=0 || args2.indexOf("https://")>=0){
//     seller_id = args[0];
//     console.log(seller_id);
//     // proxy ="http://"+ args [1];
//     //console.log ("proxy:"+proxy );
//     // casper.pageSettings.proxy = proxy;
// } else {
//     console.log("casper.exit()");
//     casper.exit();
//     casper.die();
// }

// /prodlist 参数是 seller_id



casper.start(); // 启动
casper.open("http://localhost:3000/getNullProd", {
    method: 'get',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    encoding: 'utf8'
});
var itemList_url = new Array();
casper.then(function() {
    var ps = (this.getPageContent());
    my_shop_prod_list = JSON.parse(ps);
    console.log(my_shop_prod_list.length);
    if (my_shop_prod_list.length > 0) {
        for (var i = my_shop_prod_list.length - 1; i >= 0; i--) {
            itemList_url.push(my_shop_prod_list[i]['tb_real_url']);
            //console.log(itemList_url.length);
        }
    } else {
        console.log("没有该店铺对应的商品....");
        casper.die();
    }
});
console.log("start....");
casper.then(function() {
    casper.start().each(itemList_url, function(self, link) {
        if (link.indexOf('vvic') == -1) {
            return;
        }
        try {
            self.thenOpen(link, function() {
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
                casper.waitForText("加入购物车", function then() {
                    casper.wait(5000, function() {
                        item_prod = casper.evaluate(function() {
                            return docatchDetails_vv();
                        });
                    }).then(function() {
                        this.captureSelector('VVIC_details.png', 'html'); //截图
                        //console.log(item_prod);
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

                }, function timeout() {
                    console.log("timeout!");
                    console.log("该商品已下架");
                    return;
                }, 30000)
            })

        } catch (err) {
            console.log(err);
            return;
        }

    })
})


casper.run(function() {
    this.echo('details is catched!');
    this.exit(); // <--- don't forget me!
});