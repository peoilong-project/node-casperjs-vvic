var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var moment = require('moment');
var http = require('http');
var taoee = require('./mysql.js');
var gen_url = "http://www.taoee.com/shop/product_info!buildProductContent.action?productId=";
var app = express();
app.use(bodyParser.json({ limit: '50 mb' }));
app.use(bodyParser.urlencoded({ limit: '50 mb', extended: true }));
var stop_task = false;
var port = process.env.PORT || 3000; //监听端口
try {
    //编码中间件
    app.use('*', function(request, response, next) {
        response.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    //接收店铺名称，获取店铺的VVIC地址
    app.post('/sellerName', function(req, res, next) {
        try {
            var msg = { msg: "ok" };
            var post_obj = req.body;
            console.log(post_obj);
            if (post_obj) {
                console.log('店铺名:' + post_obj.seller_name);
                taoee.query("SELECT * FROM `ec_seller_store_info` WHERE store_name =+ '" + post_obj.seller_name + "'", function(err, results) {
                    if (results.length > 0) {
                        console.log(results);
                        res.end(JSON.stringify(results));
                    } else {
                        res.end('没有找到该店铺...');
                    }
                });

            }
        } catch (err) {
            console.log(err);
        }
    });

    app.get('/vvicStore', function(req, res, next) {
        console.log("get vvic store");
        if (stop_task) {
            res.end("");
            return; //不给任务 等待
        }
        var index = parseInt(req.query.index);
        var index1 = 1;
        console.log(index1);
        sql = "select seller_id,vvic_url, taobao_url,store_name from ec_seller_store_info order by store_name DESC limit  " + index + "," + index1 + "";
        taoee.query(sql, function(err, data) {
            if (err) {
                res.end("");
            } else {
                // var data0 =data[0];  
                console.log(data);
                res.end(JSON.stringify(data)); //输出店铺vvic地址
            }
        });
    })

    //列表商品的id 和 itrm-url 用于爬虫爬行
    app.post('/prodlist', function(req, res, next) {
        try {
            //console.log(req.body);
            var msg = { msg: "ok" };
            var post_obj = req.body;
            if (post_obj) {
                // var
                ///console.log("POST_OBJ:"+JSON.stringify(post_obj));
                var seller_id = post_obj.seller_id; //获得店铺 ID
                taoee.query("select product_id,tb_real_url, seller_id from ec_product_info  where seller_id ='" + seller_id + "' and is_marketable=1", function(err, results) {
                    if (results) {
                        //产品找到
                        console.log(" 找到:" + JSON.stringify(results));
                        res.end(JSON.stringify(results));
                    }
                });
            }
        } catch (err) {
            console.log("err:" + err);
        }
    });
    //增加一个shop的产品列表
    app.post('/shop/prods', function(req, res, next) {
        console.log('post json object!')
        var msg = { msg: "ok" };
        try {
            var post_obj = req.body;
            if (post_obj) {
                //console.log(post_obj);
                var shop_url = post_obj.shop_url; //据此查询数据库找到店铺
                //var vvic_url = post_obj.vvic_url;
                var my_shop_prod_list = post_obj.product_list;
                console.log(my_shop_prod_list.length);
                for (var i = 0; i < my_shop_prod_list.length; i++) {
                    console.log(my_shop_prod_list[i]['p_name']);
                }
                //查询出店铺 Id 更新到数据库
                taoee.query("select info.seller_number, info.seller_id, info.seller_name,info.market_id,info.seller_type ,store.sub_price , store.vip_price,store.product_weight,store.type_id, cata.category_id,cata.category_path,cata.product_category_type  from ec_seller_info as info   INNER JOIN ec_seller_store_info as store on info.seller_id=store.seller_id inner join ec_product_category as cata on store.category_id=cata.category_id  where store.taobao_url like'" + shop_url + "%'", function(err, data) {
                    //查找到
                    if (data.length > 0) {
                        var seller = data[0]; //["seller_id"]; //取得 店铺
                        //构造产品录入信息
                        //console.log(seller);
                        inertOrUpdateProducts(seller, my_shop_prod_list); //shang xin  or xia jia
                    } else {
                        console.log('没有该店铺')
                    }
                });
            }
        } catch (err) {
            console.log("err:" + err);
        }
        res.end(JSON.stringify(msg));
    });

    //更新某一个商品的详情字段 
    app.post('/prod/item', function(req, res, next) {
        var msg = { msg: "ok" };
        try {
            //console.log(req.body);
            var post_obj = req.body;
            var seller_id = post_obj[1];
            post_obj = post_obj[0];
            //console.log(post_obj);
            console.log(seller_id);
            if (post_obj) {
                // var
                //console.log("POST_OBJ:" + JSON.stringify(post_obj));
                var product_id = post_obj.product_id; //获得产品 ID
                taoee.findOne("product_info", " product_id ='" + product_id + "' and seller_id ='" + seller_id + "'", function(err, data) {
                    if (data != null) {
                        //产品找到
                        console.log("产品找到");
                        var prod = data;
                        taoee.query("SELECT * FROM ec_seller_store_info WHERE seller_id = '" + seller_id + "'", function(err, data) {
                            if (data != null) {
                                var seller = data;
                                updateProd(prod, post_obj, seller, function(err, result) {
                                    if (err) {
                                        console.log("err:" + err);
                                    } else {
                                        //更新成功
                                        console.log("更新成功");
                                    }

                                });
                            }
                        })

                    }
                });
            }
        } catch (err) {
            console.log("err:" + err);
        }
        res.end(JSON.stringify(msg));
    });



    //获取详情没有爬取的商品
    app.get('/getNullProd', function(req, res, next) {
        try {
            var msg = { msg: "ok" };
            var seller_id = req.query.seller_id;
            var sql = "SELECT tb_real_url FROM ec_product_info WHERE seller_id = '" + seller_id + " ' and tb_real_url like '%vvic%' and is_marketable=1;"
            taoee.query(sql, function(err, data) {
                if (err) {
                    res.end('err');
                } else {
                    console.log(JSON.stringify(data));
                    res.end(JSON.stringify(data)); //输出店铺vvic地址
                }
            })
            res.end(msg);
        } catch (err) {

        }

    });
    /********************   读取任务接口 *****/

} catch (err) {
    console.log("err:" + err);
}

// 启动及端口
app.listen(port, function() {
    console.log('TechNode is on port' + port + '!')
});

/***********辅助函数  ****************************/
//数组对象转化为数组
function array(arr, key) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result.push(arr[i][key]);
    }
    return result;
}
//求数组差值
function arrayMinus(prod_list, temp) {
    var result = [];
    temp.forEach(function(x) {
        if (prod_list.indexOf(x) === -1) {
            result.push(x);
        } else {
            return
        }
    })
    return result;
}
//求数组交集

function intersect(prod_list, temp) {
    var result = new Array();
    var obj = {};
    for (var i = 0; i < arguments.length; i++) {
        for (var j = 0; j < arguments[i].length; j++) {
            var str = arguments[i][j];
            if (!obj[str]) {
                obj[str] = 1;
            } else {
                obj[str]++;
                if (obj[str] == arguments.length) {
                    result.push(str);
                }
            } //end else
        } //end for j
    } //end for i
    return result;
}
//vvic商品入库
//商品的更新或者添加
function inertOrUpdateProducts(seller, prod_list) {

    taoee.query("select product_id from  ec_product_info where seller_id ='" + seller.seller_id + "' and  is_marketable =1", function(err, data) {
        if (err) {
            console.log("err:" + err);
        } else {
            //存放数据库所有商品id
            var db_tid = new Array();
            for (var i = 0; i < data.length; i++) {
                //console.log(data[i]['product_id']);
                db_tid.push(data[i]['product_id'])
            }
            console.log(db_tid.length);
            //存放爬取的所有商品id
            var post_tid = new Array();
            if (prod_list != null && prod_list.length > 0) {
                for (var i = 0; i < prod_list.length; i++) {
                    //VVICupdateOrNew(seller, prod_list[i], i);
                    //findAndNew(seller, prod_list[i], i);
                    post_tid.push(prod_list[i]['p_tid']);
                }
                console.log(post_tid.length);
                // 上新，数据库中对比爬取列表商品没有的商品
                console.log('--------------------上新-----------------------');
                var new_market = arrayMinus(db_tid, post_tid);
                console.log(new_market.length);
                //更新 ，爬取列表中已存在与数据库中的商品
                console.log('--------------------更新-----------------------');
                var up_market = intersect(post_tid, db_tid);
                console.log(up_market.length);
                //下架,数据库中不存在于爬取列表id中的数据
                console.log('--------------------下架-----------------------');
                var down_market = arrayMinus(post_tid, db_tid);
                console.log(down_market.length);

                newProd(seller, new_market, prod_list, function() {
                    downProd(seller, down_market, function() {
                        updateProduct(seller, up_market, prod_list);
                    });
                });
                //updateProduct(seller, up_market);
            }
        }
    })

}

//更新商品列表url
function updateProduct(seller, up_market, prod_list) {
    var up_shop_list = new Array();
    if (up_market.length > 0) {
        for (var i = 0; i < up_market.length; i++) {
            var temp_id = up_market[i];
            for (var j = 0; j < prod_list.length; j++) {
                if (temp_id === prod_list[j]['p_tid']) {
                    up_shop_list.push(prod_list[j]);
                }
            }
        }
        //console.log(up_shop_list);
        var sub_pric = seller["sub_price"];
        var sub_vip = seller["vip_price"];

        //循环更新
        for (var k = 0; k < up_shop_list.length; k++) {
            var prod = up_shop_list[k];
            console.log("更新: " + prod.p_name);
            console.log(sub_pric);
            console.log(sub_vip);
            console.log(prod["price"]);
            if (sub_pric < 1.0) {
                var market_price = parseInt(prod["price"] / sub_pric)
            } else {
                var market_price = parseInt(prod["price"]) + parseInt(sub_pric);
            }
            if (sub_vip < 1.0) {
                var vip_price = parseInt(prod["price"] / sub_pric * sub_vip);
            } else {
                var vip_price = parseInt(prod["price"]) + parseInt(sub_pric) - parseInt(sub_vip);
            }

            console.log(market_price);
            console.log(vip_price);
            var where = {
                seller_id: seller.seller_id,
                is_marketable: 1,
                product_id: prod["p_tid"]
            }
            var sets = {
                tb_real_url: prod["link"],
                cost_price: prod["price"],
                market_price: market_price,
                vip_price: vip_price,
                product_price: prod["price"]
            }
            taoee.update("product_info", sets, where, function(err, data) {
                if (err) {
                    console.log("err:" + err);
                }
            });
        }
    }
}

//上新
function newProd(seller, new_market, prod_list, callback) {
    var new_shop_list = new Array();
    if (new_market.length > 0) {
        for (var i = 0; i < new_market.length; i++) {
            var temp_id = new_market[i];
            for (var j = 0; j < prod_list.length; j++) {
                if (temp_id === prod_list[j]['p_tid']) {
                    new_shop_list.push(prod_list[j]);
                }
            }
        }
        console.log(new_shop_list);
        //循环插入上新
        for (var k = 0; k < new_shop_list.length; k++) {
            var prod = new_shop_list[k];
            console.log("上新");
            console.log(prod.p_name);
            var pobj = {
                product_id: prod["p_tid"],
                create_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                modify_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                product_name: prod["p_name"], //商品名称【抓取字段】
                product_sn: seller["seller_number"] + prod["p_tid"], //商品编号。生成规则：商家编号（源自ec_seller_info的seller_number字段）+四位流水号。例如10010001
                tb_real_url: prod["link"],
                product_description: "", // /商品详情描述【抓取字段】/
                freeze_store: "b'0'", //可用库存（弃用）
                html_file_path: "/html/product_content/" + moment().format("YYYYMM") + "/" + prod["p_tid"] + ".html", //商品详细页面HTML路径（生成规则：/html/product_content/当前日期/商品UUID.html。例如：/html/product_content/201606/31148102c3af4d768f5b8dbc7c91645c.html）
                is_best: "b'0'", //b'0'
                is_hot: "b'0'",
                is_marketable: "b'1'", //是否上架。值为1时才会在网站显示。抓取后可默认设置成1
                is_new: "b'1'", //是否新品。值为1时才会在 每日新款 栏目显示。抓取后可默认设置成1
                //market_price: prod["price"], //市场价【抓取字段】（市场价为）
                meta_description: "", // 关键字描述（SEO）  【抓取字段】
                meta_keywords: "", //【抓取字段】 
                product_point: "b'0'",
                product_price: prod["price"], //seller["sub_price"],  //ec_seller_store_info表的sub_price字段（减去多少钱）
                //original_price : original_price
                vip_price: prod["price"], //seller["vip_price"],  //VIP价格（淘亿VIP价格）。计算策略来自ec_seller_store_info表的vip_price字段（vip会员享受多少钱）
                product_image_list_store: prod["imgUrl"], //【抓取字段】  商品图片【抓取字段】。商品详细页小图，多个图片用英文逗号隔开。例如：http://gd3.alicdn.com/bao/uploaded/i3/T1nTelXjRmXXayg3M._112351.jpg,http://gd3.alicdn.com/imgextra/i3/289739287/T28FEVXcFXXXXXXXXX_!!289739287.jpg,
                //product_store
                product_weight: parseFloat(seller["product_weight"]), // 商品重量（源自ec_seller_store_info表的product_weight字段）
                weight_unit: 1, //重量单位。固定传入1，表示kg
                brand_id: "8a2809344cd756fe014cd759232f0002", //? 固定传入
                product_category_id: seller["category_id"], //?   product_category_id  商品分类ID。外键，参照ec_product_category的主键。抓取程序应根据商品名称自动匹配（相似度匹配）到对应的最下级商品分类
                //category_path: seller["category_path"], //category_path   商品分类ID路径。源自ec_product_category表的category_path字段
                product_type_id: seller["type_id"], // 商品类型ID。外键，源自ec_seller_store_info表的type_id字段
                create_by: "8a2809344cd756fe014cd75bf56700c4", //淘亿网",  //create_by
                modify_by: "",
                //user_id    : "",
                //preferential_price : 
                //is_preferential_percent
                shipper_id: "8a2809344cd756fe014cd75bf57b00c6", //发货商。固定传入：8a2809344cd756fe014cd75bf57b00c6
                seller_id: seller["seller_id"], //商家ID。外键，参照ec_seller_info的主键
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
                product_primitive_number: prod.num, //prod["p_id"],  // seller["product_primitive_number"], //product_primitive_number 商品编码（淘宝）款号 货号
                //auto_upmarket_time : 
                //auto_downmarket_time
                cost_price: prod["price"],
                //sales_product_id
                //product_comment_id
                //modify_user_id
                is_build_html: "",
                //delivery_program_id
                //is_synchro
                market_id: seller["market_id"], //所属市场ID。源自ec_market_info主键
                product_source: 2, //product_source  商品来源（来自淘宝还是淘亿），固定传入2
                tb_spec: "", //淘宝对应商品规格【抓取字段】（用户购买时勾选的颜色、尺码等规格）。规格之间用分号隔开，规格选项之间用英文都好隔开例如：尺寸:S,M,L,;颜色分类:黑色,;
                is_remit: "b'0'", //是否属于实拍优选栏目商品。默认转入0
                product_hits: 0,
                goods_location: "TEGZ_1F_ewrer", //货架位置  默认
                product_finger_print: "",
                is_need_edit: "b'1'",
                //pass_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                sell_count: 0,
                seller_type: seller["seller_type"], //商家类型。源自ec_seller_info表的seller_type字段 
                // prompt_tag : "",
                seller_name: seller["seller_name"],
                seller_id_nofk: seller["seller_id"],
                product_zone_id_nofk: "40288223432d634601432d9e21840027"
                    // content_txt
            };
            taoee.insert("product_info", pobj, function(err) {
                if (err) {
                    console.log("err:" + err);
                }
            })
        }
    }
    callback();
}

//下架
function downProd(seller, down_market, callback) {
    if (down_market.length > 0) {
        for (var i = 0; i < down_market.length; i++) {
            var tid = down_market[i];
            var where = {
                seller_id: seller.seller_id,
                is_marketable: 1,
                product_id: tid
            };
            var sets = {
                //img  : data0["img"],
                downmarket_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                is_marketable: "b'0'",
            };
            taoee.update("product_info", sets, where, function(err, data) {
                if (err) {
                    console.log('--------------------下架-----------------------');
                    console.log("err:" + err);
                }
            });
        }
    }
    callback();
}




//更新商品详情
function updateProd(prod, post_prod, seller, cbk) {

    seller = seller[0];
    console.log(seller);
    console.log('------------------------');
    //console.log(prod);
    var sub_pric = seller["sub_price"];
    if (seller["sub_price"] < 1.0) {
        sub_pric = post_prod.p_market_price * (1 - seller["sub_price"]);
    }

    var sub_vip = seller["vip_price"];
    if (seller["vip_price"] < 1.0) {
        sub_vip = post_prod.p_market_price * (1 - seller["vip_price"]);
    }

    if (prod && post_prod) {
        var where = {
            seller_id: prod.seller_id,
            product_id: post_prod.product_id //产品
        };
        var sets = {
            product_name: post_prod.p_name,
            product_description: post_prod.item_description,
            market_price: post_prod.p_market_price,
            product_price: post_prod.p_market_price - sub_pric,
            meta_description: post_prod.meta_description,
            meta_keywords: post_prod.meta_keywords,
            product_image_list_store: post_prod.p_imgLink,
            tb_spec: "尺码:" + post_prod.tb_spec_size + ";颜色分类:" + post_prod.tb_spec_color,
            product_primitive_number: post_prod.p_number, //货号 款号
            //tb_real_url: post_prod.p_taobaoLink,
            is_pass: "b'1'",
            vip_price: post_prod.p_market_price - sub_vip,
            create_time: post_prod.p_date,
            pass_time: post_prod.p_date,
            modify_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            cost_price: post_prod.p_market_price - sub_pric
        };
        //console.log(result);
        taoee.update("product_info", sets, where, function() {
            var to_url = gen_url + post_prod.product_id;
            httpGet(to_url);
            console.log(post_prod.product_id + "已更新...");
        });


    }
}

//请求商品详情的html生成接口

function httpGet(url) {
    var http = require('http');
    //get 请求外网  
    http.get(url, function(req, res) {
        var html = '';
        req.on('data', function(data) {
            html += data;
        });
        req.on('end', function() {
            console.info(html);
        });
    });
};



/*---------------商品分类-----------------*/

//获取分类表

function getCategory() {
    taoee.query("select ");
}