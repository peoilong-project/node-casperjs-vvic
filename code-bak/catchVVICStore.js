var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

//VVIC的所有商品链接
var store_url = 'http://www.vvic.com/gz/rank/index';
var store_page_url = new Array();
var all_store_url = new Array();
var my_store_list = new Array(); //存储店铺信息
phantom.outputEncoding = "GBK"; //这里主要是防止乱码的出现
var casper = require("casper").create({
    pageSetting: { //冒充浏览器
        userAgent: user_agent,
        loadImages: false, // The WebPage instance used by Casper will
        loadPlugins: false
    },
    viewportSize: {
        width: 1920,
        height: 1080
    },
        "jquery.min.js",
        "docatch_VVIC_store.js"
    ],
    onDie: function(Casper, message, status) {
        console.log("onDie exit: " + message);
    },
    onLoadError: function(Casper, msg, Array_backtrace) {

    },
    onPageInitialized: function(pageobj) {},
    waitTimeout: 1000 * 30, // 30s  for wait* family functions.
    exitOnError: true
});
//启动
casper.start();
console.log("casper is start...");
casper.open(store_url)
    .then(function() {
        var allPage, indexPage;
        casper.captureSelector("open_store.png", "html"); //截图
        //console.log(this.getHTML());
        this.waitForText("后一页", function() {
            if (this.exists('a.next')) {
                this.echo("found next page");
                allPage = this.fetchText('.pagination .pager-jump span.pager-text').replace(/[^0-9]/ig, "");
                indexPage = 1;
                console.log("一共有" + allPage + "页");
                for (var i = 100; i <= 100; i++) {
                    var pageOne = "http://www.vvic.com/gz/rank/index?&currentPage=" + i;
                    store_page_url.push(pageOne);
                }
                //console.log(store_page_url);
            } else {
                this.echo('  not found', 'ERROR');
                return; //返回了 
            }
        })
    })
    .then(function() {
        console.log(store_page_url);
        casper.start().each(store_page_url, function(self, link) {
                self.thenOpen(link, function() {
                    casper.wait(3000, function() {
                        var page_list = casper.evaluate(function() {
                            var item = catchSellerUrl();
                            return item;
                        });
                        console.log(page_list);
                        all_store_url = all_store_url.concat(page_list);
                        console.log(all_store_url.length);
                    })
                })
            })
            .then(function() {
                console.log("catch store details");
                casper.start().each(all_store_url, function(self, link) {
                    self.thenOpen(link, function() {
                        var store_list = {}
                        casper.wait(3000, function() {
                                store_list = casper.evaluate(function() {
                                    var item = catchSellerDetails();
                                    return item;
                                });
                                console.log(JSON.stringify(store_list));
                                my_store_list = my_store_list.concat(store_list);
                                console.log(JSON.stringify(my_store_list.length));
                            })
                            .then(function() {
                                var post_obj = {};
                                post_obj.store_list = store_list;
                                casper.open('http://localhost:3000/store', {
                                    method: 'post',
                                    headers: {
                                        'Content-Type': 'application/json; charset=utf-8'
                                    },
                                    encoding: 'utf8',
                                    data: post_obj
                                });
                                casper.wait(1000 * 1);
                                return;
                            })

                    })
                })
            })
    })
casper.run();