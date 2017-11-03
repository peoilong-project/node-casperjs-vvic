function updateProd(prod, post_prod, cbk) {
    if (prod && post_prod) {
        var where = {
            product_id: post_prod.product_id //产品ID
        };
        var sets = {
            product_description: post_prod.item_description,
            market_price: post_prod.markt_price,
            meta_description: post_prod.meta_description,
            meta_keywords: post_prod.meta_keywords,
            product_image_list_store: prod["product_image_list_store"] + "," + post_prod.pics.join(","), //2017-0906
            tb_spec: "尺码:" + post_prod.tb_spec_size.join(",") + ";颜色分类:" + post_prod.tb_spec_color.join(","),
            product_primitive_number: post_prod.primitive_number, //货号 款号
            // tb_real_url : 
            modify_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        //console.log(result);
        taoee.update("product_info", sets, where, function() {
            var to_url = gen_url + post_prod.product_id;
            // httpGet(to_url);
        });


    }
}

function updateOrNew(prod, index) {
    //taoee.find("seller_info"," seller_id ='"+ seller_id +"'",function(err,seller){
    taoee.findOne("product_info", "  product_id='" + prod.p_tid + "'", function(err, data) {
        //查找到 
        console.log("找到");
        if (!err && data != null && data.length > 0) {
            //查找到 ，更新
            var data0 = data[0];
            console.log(JSON.stringify(data0))
            var where = {
                product_id: data0["p_id"]
            };
            var sets = {
                //img  : data0["img"],
                modify_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                market_price: prod["price"],
                product_name: prod["p_name"],
                product_sn: prod["p_id"],
                tb_real_url: prod["link"]
            };

            taoee.update("product_info", sets, where, function() {

            });
        } else { //添加
            var pobj = {
                product_id: prod["p_tid"],
                create_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                modify_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                product_name: prod["p_name"], //商品名称【抓取字段】
                product_sn: prod["seller_id"] + prod["p_id"], //商品编号。生成规则：商家编号（源自ec_seller_info的seller_number字段）+四位流水号。例如10010001
                tb_real_url: prod["link"],
                product_description: "", // /商品详情描述【抓取字段】/
                freeze_store: '0', //可用库存（弃用）
                html_file_path: "/html/product_content/" + moment().format("YYYYMM") + "/" + prod["p_id"] + ".html", //商品详细页面HTML路径（生成规则：/html/product_content/当前日期/商品UUID.html。例如：/html/product_content/201606/31148102c3af4d768f5b8dbc7c91645c.html）
                is_best: "b'0'", //b'0'
                is_hot: "b'0'",
                is_marketable: "b'1'", //是否上架。值为1时才会在网站显示。抓取后可默认设置成1
                is_new: "b'1'", //是否新品。值为1时才会在 每日新款 栏目显示。抓取后可默认设置成1
                market_price: prod["price"], //市场价【抓取字段】（市场价为）
                meta_description: "", // 关键字描述（SEO）  【抓取字段】
                meta_keywords: "", //【抓取字段】 
                product_point: '0',
                product_price: prod["price"], //seller["sub_price"],  //ec_seller_store_info表的sub_price字段（减去多少钱）
                // original_price : original_price
                // vip_price: prod["price"] - sub_vip, //seller["vip_price"],  //VIP价格（淘亿VIP价格）。计算策略来自ec_seller_store_info表的vip_price字段（vip会员享受多少钱）
                product_image_list_store: prod["imgUrl"], //【抓取字段】  商品图片【抓取字段】。商品详细页小图，多个图片用英文逗号隔开。例如：http://gd3.alicdn.com/bao/uploaded/i3/T1nTelXjRmXXayg3M._112351.jpg,http://gd3.alicdn.com/imgextra/i3/289739287/T28FEVXcFXXXXXXXXX_!!289739287.jpg,
                //product_store
                product_weight: '0.3', // 商品重量（源自ec_seller_store_info表的product_weight字段）
                weight_unit: 1, //重量单位。固定传入1，表示kg
                brand_id: "8a2809344cd756fe014cd759232f0002", //? 固定传入
                product_category_id: '402882b242b705200142b721ae830002', //?   product_category_id  商品分类ID。外键，参照ec_product_category的主键。抓取程序应根据商品名称自动匹配（相似度匹配）到对应的最下级商品分类
                // category_path: seller["category_path"], //category_path   商品分类ID路径。源自ec_product_category表的category_path字段
                //  product_type_id: seller["type_id"], // 商品类型ID。外键，源自ec_seller_store_info表的type_id字段
                create_by: "8a2809344cd756fe014cd75bf56700c4", //淘亿网",  //create_by
                modify_by: "",
                //user_id    : "",
                //preferential_price : 
                //is_preferential_percent
                shipper_id: "8a2809344cd756fe014cd75bf57b00c6", //发货商。固定传入：8a2809344cd756fe014cd75bf57b00c6
                //  seller_id: seller["seller_id"], //商家ID。外键，参照ec_seller_info的主键
                //balance_way : 
                //base_price
                //balance_percentage
                //area_path
                //repository_id
                //upmarket_time
                //downmarket_time
                //hot_time
                //best_time
                new_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                is_delete: "b'0'",
                is_pass: "b'0'",
                is_cod: "b'0'",
                is_groupbuy: "b'0'",
                is_integral: "b'0'",
                //change_need_integral
                //product_refer_id
                product_zone_id: "40288223432d634601432d9e21840027", //? 
                product_primitive_number: "", //prod["p_id"],  // seller["product_primitive_number"], //product_primitive_number 商品编码（淘宝）款号 货号
                //auto_upmarket_time : 
                //auto_downmarket_time
                cost_price: '0',
                //sales_product_id
                //product_comment_id
                //modify_user_id
                is_build_html: '',
                //delivery_program_id
                //is_synchro
                // market_id: seller["market_id"], //所属市场ID。源自ec_market_info主键
                product_source: 2, //product_source  商品来源（来自淘宝还是淘亿），固定传入2
                tb_spec: "", //淘宝对应商品规格【抓取字段】（用户购买时勾选的颜色、尺码等规格）。规格之间用分号隔开，规格选项之间用英文都好隔开例如：尺寸:S,M,L,;颜色分类:黑色,;
                is_remit: "b'0'", //是否属于实拍优选栏目商品。默认转入0
                product_hits: 0,
                goods_location: "TEGZ_1F_ewrer", //货架位置  默认
                product_finger_print: "",
                is_need_edit: "b'1'",
                pass_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                sell_count: 0,
                // seller_type: seller["seller_type"], //商家类型。源自ec_seller_info表的seller_type字段 
                // prompt_tag : "",
                seller_name: prod["seller_name"],
                //  seller_id_nofk: seller["seller_id"],
                product_zone_id_nofk: "40288223432d634601432d9e21840027"
                    // content_txt
            };

            taoee.insert("product_info", pobj, function(err) {
                //
            });

        }
    });

}



casper.open(item.tb_real_url, function() {
    this.captureSelector('vv_de.png', 'html'); //截图
    console.log("is comming vvic details");
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
            casper.wait(1000 * 2, function() {
                    item_prod_vv.product_id = item.product_id;
                    //等待3S 获取成功
                    //console.log("json:" + JSON.stringify(item_prod_vv));
                    p_taobaoLink = item_prod_vv[0]['p_taobaoLink'];
                    console.log("跳转淘宝对应详情页..." + p_taobaoLink);
                })
                .then(function() {
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
                                    console.log("json:" + JSON.stringify(item_prod));
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

});




// ---------------------clickDetails.js------------------------
// casper.then(function() {
//     casper.start().each(itemList_url, function(self, link) {
//         self.thenOpen(link, function() {
//             var item_prod_vv = {};
//             var item_prod = {};
//             var url = (this.getCurrentUrl());
//             if (url.indexOf("taobao") >= 0) {
//                 var isXianyu = "";
//                 casper.waitFor(function check() {
//                     isXianyu = casper.evaluate(function() {
//                         return isXianyu();
//                     });
//                     if (isXianyu != null) {
//                         return true;
//                     }
//                 }, function then() { // step to execute when check() is ok
//                     if (isXianyu.indexOf("hellip") >= 0) {
//                         console.log("该链接已跳转至闲鱼...........");
//                         //console.log("不进行处理，执行下一个...........");
//                         return false;
//                     }
//                     //此时进入第一页的页面
//                     this.echo("taobao shop details is come !"); //看到 下一页 ，进入循环点击 每一产品列表页的过程
//                     this.captureSelector('next_item.png', 'html'); //截图
//                     casper.wait(2000, function() {
//                             //可以读取产品信息了
//                             console.log("开始分析淘宝详情页面.......");
//                             item_prod = casper.evaluate(function() {
//                                 return docatchDetails_taobao();
//                             });
//                         })
//                         .then(function() {
//                             casper.wait(1000 * 2, function() {
//                                 item_prod.product_id = item.product_id;
//                                 console.log(item.product_id);
//                                 //等待3S 获取成功
//                                 console.log("json:" + JSON.stringify(item_prod));
//                                 casper.open("http://localhost:3000/prod/item", {
//                                     method: 'post',
//                                     headers: {
//                                         'Content-Type': 'application/json; charset=utf-8'
//                                     },
//                                     encoding: 'utf8',

//                                     data: item_prod
//                                 });
//                             })
//                         });
//                 }, function timeout() { // step to execute if check has failed
//                     console.log("当前链接异常..." + item.tb_real_url);
//                 })
//             }
//         })
//     })
// })

function catchItem(item) {
    casper.wait(1000 * 1, function() {
        // console.log(item.product_id);
        console.log(item.tb_real_url);
        var item_prod_vv = {};
        var item_prod = {};
        //console.log(item.tb_real_url);
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
                                    console.log("json:" + JSON.stringify(item_prod));
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
                    console.log(this.fetchText('.sold-info'));
                    var isNone = this.fetchText('.sold-info');

                    if (isNone.indexOf("下架") != -1) {
                        console.log("该商品已下架");
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
                            casper.wait(1000 * 2, function() {
                                    item_prod_vv.product_id = item.product_id;
                                    //等待3S 获取成功
                                    //console.log("json:" + JSON.stringify(item_prod_vv));
                                    p_taobaoLink = item_prod_vv[0]['p_taobaoLink'];
                                    console.log("跳转淘宝对应详情页..." + p_taobaoLink);
                                })
                                .then(function() {
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

    });
}

casper.run(function() {
    this.echo('So the whole suite ended.');
    this.exit(); // <--- don't forget me!
});

// casper.then(function() {
//     casper.start().each(links, function(self, link) {
//         self.thenOpen(link, function() {
//             this.echo(this.getTitle());
//         });
//     });
// })

// function clickShopDetails(shopurl) {
//     casper.open(shopurl)
//         .waitForText("加入购物车", function() {
//             console.log("is comming details!")
//             casper.captureSelector("details.png", 'html') //截图
//             var shop_list = casper.evaluate(function() {
//                 var item = docatchDetails();
//                 return item;
//             });
//             my_shop_prod_details.concat(shop_list);
//         }, function() {
//             console.log("erro");
//         }, 3000);

// }
// .then(function() {
//     // console.log(my_shop_prod_list.length);
//     //储存详情链接
//     var p_link_array = [];
//     //储存淘宝链接 
//     var p_taobaoLink = [];
//     if (my_shop_prod_list.length > 0) {
//         for (var j = 0; j < my_shop_prod_list.length; j++) {
//             //提取商品详情页链接
//             p_link_array.push(my_shop_prod_list[j]["p_link"]);
//             //淘宝id补充为淘宝详情页链接
//             p_taobaoLink.push('https://item.taobao.com/item.htm?id=' + my_shop_prod_list[j]["p_tid"]);
//         }
//     }

//-------------------------------------------VVIC.com详情------------------------
//依次打开每个商品详情页
// casper.start().each(p_link_array, function(self, link) {
//     self.thenOpen(link, function() {
//         casper.waitForText("加入购物车", function() {
//             console.log("is comming details!")
//             casper.captureSelector("details.png", 'html') //截图
//             var shop_list = casper.evaluate(function() {
//                 var item = docatchDetails_vv();
//                 return item;
//             });
//             my_shop_prod_details.concat(shop_list);
//         }, function() {
//             console.log("erro");
//         }, 3000);
//     });
// });

//-------------------------------------------淘宝详情------------------------
//依次打开每个商品详情页
// casper.start().each(p_taobaoLink, function(self, link) {
// self.thenOpen(link, function() {
//     console.log(link);
//     casper.waitForText("加入购物车", function() {
//         console.log("is comming details!")
//         casper.captureSelector("details.png", 'html') //截图
//         var shop_list = casper.evaluate(function() {
//             var item = docatchDetails_taobao();
//             return item;
//         });
//         // console.log(shop_list);
//         // my_shop_prod_details.concat(shop_list);
//         console.log(shop_list.length);
//         //提交数据
//         var postData = JSON.stringify(shop_list);
//         console.log(postData);
//         casper.open('http://localhost:3000/prodlist', {
//             method: 'post',
//             headers: {
//                 'Content-Type': 'application/json; charset=utf-8'
//             },
//             encoding: 'utf8',
//             data: postData
//         });
//         casper.then(function() {
//             this.echo('POSTED it.');
//         });
//     }, function() {
//         console.log("erro");
//     }, 3000);
// });
// });
// });
// casper.run();


// ------------watchshoplist---------

function start_casper(script, vvic_url, shop_url, seller_id) {
    var chirld_cmd = cmd + " " + script + '  "' + vvic_url + ' ' + shop_url + '"';
    var child_cmd2 = cmd + 'clickShopDetails.js "' + seller_id + '"';
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
            GetOneShop(function(task) {
                var vvic_url = task.vvic_url;
                var shop_url = task.taobao_url;
                var seller_id = task.seller_id;
                console.log("vvic_url:" + vvic_url);
                start_casper("catchShopList.js", vvic_url, shop_url, seller_id);
            });
        })

    })
}


// ---------------------------------catch_details------------
//爬取vvic详情 --> 淘宝详情 --> 入库
var user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
var seller_id = "8a2809344ceaee37014cef7f725501cb";

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
    waitTimeout: 1000 * 30, // 30s  for wait* family functions.
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
            itemList_url.push(my_shop_prod_list[i]['tb_real_url']);
            //console.log(itemList_url.length);
        }
    } else {
        console.log("没有该店铺对应的商品....");
        casper.die();
    }
});

casper.then(function() {
    console.log("分析详情页...");
    casper.start().each(itemList_url, function(self, link) {
        try {
            self.thenOpen(link, function() {
                var item_prod_vv = {};
                var item_prod = {};
                if (link.indexOf("taobao") >= 0) {
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
                        casper.wait(1000, function() {
                                //可以读取产品信息了
                                console.log("开始分析淘宝详情页面.......");
                                item_prod = casper.evaluate(function() {
                                    return docatchDetails_taobao();
                                });
                            })
                            .then(function() {
                                casper.wait(1000 * 2, function() {
                                    console.log(item_prod[0]['product_id']);
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
                        console.log("当前链接异常..." + link);
                        return;
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
                    var canBuy = this.fetchText('.product-intro .btns .btn.btn_red');
                    if (canBuy.indexOf("加入购物车") == -1) {
                        console.log("该商品已下架");
                        return;
                    }
                    try {
                        casper.then(function() {
                            //可以读取产品信息了
                            console.log("开始分析VV页面.......");
                            item_prod_vv = casper.evaluate(function() {
                                return docatchDetails_vv();
                            });

                            var p_taobaoLink = '';
                            if (item_prod_vv[0]['p_taobaoLink'].length < 1) {
                                return
                            }
                            casper.wait(1000 * 1, function() {
                                    //等待3S 获取成功
                                    //console.log("json:" + JSON.stringify(item_prod_vv));
                                    p_taobaoLink = item_prod_vv[0]['p_taobaoLink'];
                                    console.log("跳转淘宝对应详情页..." + p_taobaoLink);
                                })
                                .then(function() {
                                    if (p_taobaoLink.indexOf('taobao') == -1) {
                                        return;
                                    }
                                    casper.thenOpen(p_taobaoLink, function() {
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
                                                        console.log(item_prod[0]['product_id']);
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
                                            return;
                                        })
                                    })

                                })
                        });
                    } catch (err) {
                        console.log(err);
                        return;
                    }
                }
            })

        } catch (err) {
            console.log(err);
            return;
        }

    })
})


casper.run(function() {
    this.echo('So the whole suite ended.');
    this.exit(); // <--- don't forget me!
});


// ---------------------------------getname------------end--------------------
//打开链接
// casper.thenOpen(shop_url, function() {
//     if (this.exists('.goods-list')) {
//         this.echo('found   ', 'INFO');
//         //casper.captureSelector('found.png', 'html'); //截图
//     } else {
//         this.echo('  not found', 'ERROR');
//         var postData = {};
//         casper.captureSelector("not found", 'html');
//         var isClose = this.fetchText(".empty-tip .text");
//         console.log(isClose);
//         // if (isClose.indexOf("没有找到相关档口") != -1) {
//         //     postData.seller_name = store_name;
//         //     casper.open("http://localhost:3000/closeStore", {
//         //         method: 'post',
//         //         headers: {
//         //             'Content-Type': 'application/json; charset=utf-8'
//         //         },
//         //         encoding: 'utf8',
//         //         data: postData
//         //     });
//         //     //casper.captureSelector('not_found.png', 'html'); //截图
//         // }

//         casper.wait(2000, function() {
//             casper.die();
//         })
//     }
// })