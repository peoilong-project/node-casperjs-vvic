var address_list = new Array(); //返回的该地区的下级地区链接集合
var store_list_url = new Array();
//一个地区的下级链接
function address_child() {
    __utils__.echo("catch address...");
    var items = $('.mk-list .item');
    if (items.length < 1) {
        __utils__.echo("not found");
    }

    items.each(function() {
        var item = {};
        item.name = $(this).find('img').attr('alt');
        //__utils__.echo(address_item.name);
        item.url = "http://www.vvic.com" + $(this).find('a').attr('href');
        address_list.push(item);
    });
    //__utils__.echo(address_list);
    return address_list;
}
//获取某地区的所有店铺vvic链接
function getVVicStore() {
    __utils__.echo("catch address vvic url...");
    var items = $('.mk-shops>dl');
    if (items.length < 1) {
        __utils__.echo("not found");
    }
    items.each(function() {

        if ($(this).attr('data-id') < 0) {
            __utils__.echo("is hot");
            return;
        } else {
            $(this).find('li.last').each(function() {
                var store = {};
                store.name = $(this).find('a.items').attr('data-title');
                store.market = $(this).find('a.items').attr('data-market');
                store.address = $(this).find('a.items').attr('data-source');
                store.url = 'http://www.vvic.com' + $(this).find('a.items').attr('href');

                __utils__.echo(store.name);
                __utils__.echo(store.market);
                __utils__.echo(store.address);
                __utils__.echo(store.url);
                store_list_url.push(store);
            })
        }

    })
    return store_list_url;
}