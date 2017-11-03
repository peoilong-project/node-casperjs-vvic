var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
//搜款网店铺url
var adress_store = "";
var my_store_list = new Array(); //数组存储所有店铺
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
        "docatchVVicStore.js"
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
    adress_store = "http://www.vvic.com/" + args[0] + "/markets.html";
    console.log(adress_store);
    // proxy ="http://"+ args [1];
    //console.log ("proxy:"+proxy );
    // casper.pageSettings.proxy = proxy;
} else {
    console.log("请输入地区参数：如广州则输入: gz");
    casper.exit();
    casper.die();
}

//启动
casper.start();
console.log("start");
//创建鼠标对象
//var mouse = require("mouse").create(casper);
// console.log("mouse");

//打开链接
casper.thenOpen(adress_store, function() {
    casper.wait(2000, function() {

    })
    var address_list = casper.evaluate(function() {
        return address_child();
    });
    var item_url = new Array();
    for (var i = 0; i < address_list.length; i++) {
        //console.log(address_list[i]['url']);
        item_url.push(address_list[i]['url']);
    }
    console.log(item_url.length);
    casper.start().each(item_url, function(self, link) {
        self.thenOpen(link, function() {
            this.echo(this.getTitle());
            var item = this.evaluate(function() {
                return getVVicStore();
            })
            casper.wait(2000,function(){
                casper.open()
            })
        });
    });
    // casper
})
casper.run();