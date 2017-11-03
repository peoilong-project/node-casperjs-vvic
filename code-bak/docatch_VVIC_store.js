// 一个页面
var storelist = new Array();
// 一个对象
var store = {};
// 所有店铺的url
var storeUrl = new Array();

function catchSellerUrl() {
    __utils__.echo("ready catchSellerUrl...");
    //抓取所有档口的url
    $('.rank-main .rank-tab td.rank-shop-info .rank-shop-name').each(function() {
        var url = 'http://www.vvic.com' + $(this).find('a').attr('href');
        // __utils__.echo(url);
        storeUrl.push(url);
    })
    return storeUrl;
}

function isOnload() {
    var len = $('.pagination').length;
    __utils__.echo(len);
    if (len > 0) {
        return $('.pagination').length;
    } else {
        return false;
    }
}

function catchSellerDetails() {
    __utils__.echo("ready catchSellerDetails...");
    //店铺名称
    store.store_name = $('.shop-info .shop-content h2.shop-name span').text();
    //seller_store_info_id
    store.seller_store_info_id = $('.shop-info .shop-content a.icon-btn').attr('data-sid');
    //__utils__.echo(store.seller_store_info_id);
    //seller_id
    store.seller_id = $('.shop-info .shop-content a.icon-btn').attr('data-sid') + 's';
    // __utils__.echo(store.seller_id);
    //淘宝url
    $('.shop-info .shop-content .btns a').each(function() {
        if ($(this).text()) {
            store.taobao_url = $(this).attr('href');
        }
    });
    //__utils__.echo(store.taobao_url);
    //vvic url
    store.vvic_url = 'http://www.vvic.com' + $('.stall-head .stall-head-name a').attr('href');
    //__utils__.echo(store.vvic_url);
    //店铺信息
    $('.shop-content .mt10 li').each(function() {
        if ($(this).find('.attr').text() == '主营：') {
            store.scope = "";
            $(this).find('.text a').each(function() {
                    store.scope += $(this).text() + " ";
                })
                // __utils__.echo(store.scope);
        }
        if ($(this).find('.attr').text() == '电话：') {
            store.phone = $(this).find('.text p:first-of-type').text();
            // __utils__.echo(store.phone);
        }
        if ($(this).find('.attr').text() == 'QQ：') {
            store.email = $(this).find('.text').text().replace(/(^\s+)|(\s+$)/g, "");
            //__utils__.echo(store.email);
        }
        if ($(this).find('.attr').text() == '产地：') {
            store.address = $(this).find('.text').text().replace(/(^\s+)|(\s+$)/g, "");
            // __utils__.echo(store.address);
        }
        if ($(this).find('.attr').text() == '商品：') {
            store.count = $(this).find('.text').text().replace(/[^0-9]/ig, "");
            // __utils__.echo(store.count);
        }
    });
    storelist.push(store);
    return storelist;
}