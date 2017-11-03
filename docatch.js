// 一个页面
var productlist = new Array();
//一个商品详情
var producDtlist_vv = new Array();
//店铺链接
var shop_url_list = new Array();
// 一个对象
var prod = {};
var productD = {};

function getTaobao_url() {
    __utils__.echo("店铺淘宝链接");
    //店铺淘宝链接btns
    var taobao_url = $('.shop-content .btns a:last-of-type').attr("href");
    //__utils__.echo(taobao_url);
    return taobao_url;
}

function docatch() {
    __utils__.echo("ready...");
    var items = $(".goods-list.shop-list li .item");
    if (items.length < 1) {
        __utils__.echo("not item...");
    };
    //.goods-list ul li .item .pic .ctrl span
    items.each(function() {
        // __utils__.echo("p_id: "+ $(this).find('span.upload').attr("data-id"));
        //局部变量，临时存放
        var prod = {};
        //店铺名称
        prod.seller_name = $('.shop-info .shop-content h2.shop-name>span').text();
        //__utils__.echo(prod.seller_name);

        //店铺淘宝链接btns
        // prod.taobao_url = $('.shop-content .btns a:last-of-type').attr("href");
        // __utils__.echo(prod.taobao_url);

        // });
        //商品id
        prod.p_id = $(this).find('span.upload').attr("data-id");

        //商品淘宝id
        prod.p_tid = $(this).find('span.upload').attr("data-tid");
        //__utils__.echo(prod.p_tid);
        //货号
        prod.num = $(this).find('div.j_clip_button').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(prod.num);
        //商品链接
        prod.link = 'http://www.vvic.com/' + $(this).find('.pic>a').attr("href");
        //__utils__.echo( prod.p_lin);

        // 商品图片链接
        prod.imgUrl = 'http:' + $(this).find('img').attr("src");
        //__utils__.echo(prod.imgUrl);

        //商品价格
        prod.price = $(this).find('.price').text().replace(/[^\d.]/g, '');
        __utils__.echo(prod.price);

        //上线日期
        prod.date = $(this).find('.shop-name').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(prod.date);

        //商品名称
        prod.p_name = $(this).find('.title>a').text().replace(/(^\s+)|(\s+$)/g, "");
        __utils__.echo(prod.p_name);

        productlist.push(prod);
    });
    //__utils__.echo("productlist leng:"+ productlist.length);
    return productlist;
}


function getStoreUrl() {
    __utils__.echo("get store url...");
    $('.stall-dl .dline .cell:first-child a').each(function() {
        var shop_url = "http://www.vvic.com/" + $(this).attr("href");
        shop_url_list.push(shop_url);
    })

    return shop_url_list;
}
//分析搜款网商品详情
function docatchDetails_vv() {
    // __utils__.echo("ready...");
    var items = $(".item-left");
    if (items.length < 1) {
        __utils__.echo("not item...");
    };
    //.goods-list ul li .item .pic .ctrl span
    items.each(function() {
        // __utils__.echo("p_id: "+ $(this).find('span.upload').attr("data-id"));
        //局部变量，临时存放
        var productD = {};

        //店铺名称
        productD.p_seller = $('.stall-head .stall-head-name a').text();
        //__utils__.echo(productD.p_seller);

        //商品淘宝链接
        productD.p_taobaoLink = $(this).find('div.name>a').attr("href").replace(/(^\s+)|(\s+$)/g, "");
        // __utils__.echo(productD.p_taobaoLink);

        //商品id
        productD.product_id = $(this).find('div.name>a').attr("href").replace(/[^0-9]+/g, '');
        //__utils__.echo(productD.product_id);
        //商品名称
        productD.p_name = $(this).find('div.name>h1').text().replace(/(^\s+)|(\s+$)/g, "");
        // __utils__.echo(productD.p_name);

        //商品批发价
        productD.p_price = $(this).find('.p-value strong.sale').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_price);

        //商品淘宝价
        productD.p_market_price = $(this).find('.v-price span.sale').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_market_price);


        productD.p_number = ""; //商品货号
        productD.p_date = ""; //上新日期
        productD.tb_spec_size = ""; //尺寸
        productD.tb_spec_color = ""; //颜色

        $(this).find(".product-intro dl.summary dd .name").each(function() {
            var item = $(this).text().replace(/(^\s+)|(\s+$)/g, "");
            if (item.indexOf("货号") != -1) {
                productD.p_number = $(this).nextAll('.value').text().replace(/(^\s+)|(\s+$)/g, "");
                __utils__.echo(productD.p_number);
            }
            if (item.indexOf("时间") != -1) {
                productD.p_date = $(this).nextAll('.value').text().replace(/(^\s+)|(\s+$)/g, "");
                __utils__.echo(productD.p_date);
            }
            if (item.indexOf("尺") != -1) {
                $(this).nextAll('.value').find('a').each(function() {
                    productD.tb_spec_size += $(this).text().replace(/(^\s+)|(\s+$)/g, "") + ",";
                });
                //__utils__.echo(productD.tb_spec_size);
            }

            if (item.indexOf("颜色") != -1) {
                $(this).nextAll('.value').find('li').each(function() {
                    if ($(this).attr('data-color') == undefined) {
                        var temp = "";
                        $('.desc-attr ul').find('li[title*="颜色"]').each(function() {
                            temp += $(this).attr('title').split(':')[1] + ',';
                        })
                        var color_list = temp.split('色');
                        productD.tb_spec_color = color_list.join(',');
                    } else {
                        productD.tb_spec_color += $(this).attr('data-color') + ",";

                    }
                })
                productD.tb_spec_color = productD.tb_spec_color.substring(0, productD.tb_spec_color.length - 1);
                __utils__.echo(productD.tb_spec_color);
            }
        });
        //商品meta_description

        productD.meta_description = $('meta[name=description]').attr("content");
        //__utils__.echo(productD.meta_description);

        //商品meta_keywords
        productD.meta_keywords = $('meta[name=keywords]').attr("content");
        //__utils__.echo(productD.meta_keywords);

        //商品图片
        productD.p_imgLink = "";
        $('#thumblist li img').each(function() {
            //__utils__.echo($(this).html());
            productD.p_imgLink += ("https:" + $(this).attr('big') + ',');
        });
        productD.p_imgLink = productD.p_imgLink.substring(0, productD.p_imgLink.length - 1);
        __utils__.echo(productD.p_imgLink);
        //商品详情
        productD.item_description = "<style>img{opacity:1}</style>";
        productD.item_description += $('.content-more .desc-attr').html().replace(/(^\s*)|(\s*$)/g, "") + $('.content-more .desc-content').html().replace(/(^\s*)|(\s*$)/g, "");
        //去掉无效img的路径
        productD.item_description = productD.item_description.replace(/data-original/g, 'src');
        //去掉opacity属性
        productD.item_description = productD.item_description.replace(/opacity/g, 'chance');
        //__utils__.echo(productD.item_description);

        producDtlist_vv.push(productD);
    });
    //__utils__.echo("productlist leng:"+ productlist.length);
    return producDtlist_vv;
}