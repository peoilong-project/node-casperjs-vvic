var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
//搜款网店铺url
var shop_prods = "http://localhost:3000/prodlist";
var seller_id = "";
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
    seller_id = args[0];
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
var items_url = new Array(); //储存商品id
var ietms_url_err = new Array(); //储存失败的商品id
casper.then(function() {
    var ps = (this.getPageContent());
    var my_shop_prod_list = JSON.parse(ps);
    for (var i = 0; i < my_shop_prod_list.length; i++) {
        if (my_shop_prod_list[i]['product_id'].length < 32) {
            items_url.push("http://www.taoee.com/shop/product_info!buildProductContent.action?productId=" + my_shop_prod_list[i]['product_id']);
        }
    }
    console.log(items_url.length);
})
casper.then(function() {
    console.log('提交...');
    //依次生成该店铺的商品详情页
    casper.start().each(items_url, function(self, link) {
        try {
            casper.wait(2000, function() {
                self.thenOpen(link, function() {
                    var ps = this.getPageContent();
                    if (ps === '1') {

                    } else {
                        console.log("该链接失败：" + link);
                        ietms_url_err.push(link);
                    }
                    casper.waitFor(function check() {

                    }, function then() {
                        console.log("已更新：" + link);
                        console.log(ps);
                        casper.captureSelector("updateHtml.png", "html");
                    }, function timeout() {

                    })
                })
            })

        } catch (err) {

            return;
        }
    })
})
casper.then(function() {
    console.log(ietms_url_err.length);
    if (items_url.length > 0) {

    }
})



casper.run();