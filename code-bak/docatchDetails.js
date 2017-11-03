// 一个页面
var producDtlist_vv = new Array();
var producDtlist_taobao = new Array();
// 一个对象
var productD = {};
var productT = {};

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
        //productD.p_seller = $('.stall-head .stall-head-name a').text();
        //__utils__.echo(productD.p_seller);

        //商品淘宝链接
        productD.p_taobaoLink = $(this).find('div.name>a').attr("href").replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_taobaoLink);

        //商品名称
        //productD.p_name = $(this).find('div.name>h1').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_name);

        //商品批发价
        //productD.p_market = $(this).find('.v-price strong.sale').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_market);

        //商品淘宝价
        //productD.p_taobaoPrice = $(this).find('.v-price span.sale').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_taobaoPrice);

        //商品货号
        //productD.p_number = $(this).find('div.ff-arial:nth-of-type(1)').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_number);

        //上新日期
        //productD.p_date = $(this).find('div.ff-arial:nth-of-type(2)').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_date);

        //商品尺码
        //productD.p_size = $(this).find('.v-sku dd:nth-of-type(1) div.goods-choice').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_size);

        //商品颜色
        //productD.p_color = $(this).find('.v-sku dd:nth-of-type(2) div.goods-choice a').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_color);

        //商品颜色
        //productD.p_color = $(this).find('.desc-attr li:nth-of-type(1) div.goods-choice').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productD.p_color);

        //商品详情
        //productD.p_details = $(this).find('.desc-attr').text();
        //__utils__.echo(productD.p_details);

        producDtlist_vv.push(productD);
    });
    //__utils__.echo("productlist leng:"+ productlist.length);
    return producDtlist_vv;
}

//分析淘宝商品详情
function docatchDetails_taobao() {
    __utils__.echo("ready...");
    var items = $("#bd");
    if (items.length < 1) {
        __utils__.echo("not item...");
    };
    //.goods-list ul li .item .pic .ctrl span
    items.each(function() {
        // __utils__.echo("p_id: "+ $(this).find('span.upload').attr("data-id"));
        //局部变量，临时存放
        var product_taobao = {};
        //商品淘宝id
        productT.product_id = $(this).find('div#J_Pine').attr("data-itemid").replace(/(^\s+)|(\s+$)/g, "");

        //店铺名称
        productT.p_seller = $(this).find('.tb-shop-info-hd .tb-shop-name a').text();
        //__utils__.echo(productT.p_seller);

        //商品淘宝链接
        productT.p_taobaoLink = 'https://item.taobao.com/item.htm?id=' + $(this).find('div#J_Pine').attr("data-itemid").replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productT.p_taobaoLink);

        //商品图片
        productT.p_imgLink = "";
        $('.tb-gallery .tb-thumb li img').each(function() {
            productT.p_imgLink += ("https:" + $(this).attr('src') + ',');
        });
        //__utils__.echo(productT.p_imgLink);
        //商品名称
        productT.p_name = $(this).find('#J_Title h3').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productT.p_name);

        //商品淘宝价
        productT.p_taobaoPrice = $(this).find('#J_StrPrice .tb-rmb-num').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productT.p_taobaoPrice);

        //商品货号
        productT.p_number = '';
        $("ul.attributes-list > li  ").each(function(index) {
            var attr_str = $.trim($(this).text());
            if (attr_str.indexOf("货号:") >= 0) {
                productT.p_number = attr_str.replace("货号:", ""); // ||attr_str.indexOf("货号")>=0  货号: 2750
            }
            if (attr_str.indexOf("款号:") >= 0) {
                productT.p_number = attr_str.replace("款号:", ""); // ||attr_str.indexOf("货号")>=0
            }
        });
        //__utils__.echo(productT.p_number);
        //__utils__.echo(productT.p_size);

        //商品尺码
        productT.tb_spec_size = "";
        $(this).find('ul[data-property*="尺"] li span').each(function() {
            productT.tb_spec_size += $(this).text() + ",";
        });
        // __utils__.echo(productT.tb_spec_size);

        //上新日期
        productT.p_date = $(this).find('#attributes li[title*="年"]').text().replace(/(^\s+)|(\s+$)/g, "");
        //__utils__.echo(productT.p_date);

        //商品颜色
        productT.tb_spec_color = "";
        $(this).find('ul[data-property*="颜色"] li span').each(function() {
            productT.tb_spec_color += $(this).text() + ",";
        });
        //__utils__.echo(productT.tb_spec_color);
        //__utils__.echo(productT.p_color);

        //商品详情
        productT.p_details = $(this).find('#attributes .attributes-list').html() + " ";
        //__utils__.echo(productT.p_details);

        //商品item_description
        productT.item_description = $(this).find('div#J_DivItemDesc').html() + " ";

        //商品meta_description
        productT.meta_description = $('meta[name=description]').attr("content");
        //__utils__.echo(productT.meta_description);

        //商品meta_keywords
        productT.meta_keywords = $('meta[name=keywords]').attr("content");
        //__utils__.echo(productT.meta_keywords);

        producDtlist_taobao.push(productT);
    });
    //__utils__.echo("productlist leng:"+ productlist.length);
    return producDtlist_taobao;
}

//判断是否是咸鱼页面
function isXianyu() {
    //__utils__.echo("xianyu...");
    //__utils__.echo($('title').html());
    return $('title').html();
}