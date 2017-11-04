var mysqldb = {};
var util = require('util');
var mysql = require('mysql');
const prefix = 'ec_';

const db = mysql.createPool({
   
});
var findOne = function(table, where, callback) { //查找一条；
    // whre is arr; [{id:1},{username:admin}];
    var _WHERE = '';
    if (util.isObject(where)) {
        _WHERE += 'WHERE ';
        for (var k in where) {
            _WHERE += k + "='" + where[k] + "' AND ";
        }

        _WHERE = _WHERE.slice(0, -4);
    } else if (typeof where == 'string') {
        _WHERE = 'WHERE ' + where;
    }
    var sql = "SELECT * FROM " + prefix + table + ' ' + _WHERE + ' LIMIT 1';
    console.log(sql + '-------------------------');
    db.query(sql, function(err, data) {
        if (err) {
            callback(err, 0);
        } else {
            callback(err, data[0]);
        }
    });
}


var select = function(table, callback) { //查找所有；
    var sql = "SELECT * FROM " + prefix + table;
    console.log(sql);
    db.query(sql, callback);
}

var query = function(sql, callback) {
    console.log(sql);
    db.query(sql, callback);
};

var insert = function(table, obj, callback) {
        //insert into table() values()
        //{username:'guojikai',age:'55',sex:'1'}
        var fields = '';
        var values = '';
        for (var k in obj) {
            fields += k + ',';
            if (obj[k] == "b'0'" || obj[k] == "b'1'") {
                var b = "0";
                if (obj[k] == "b'1'") {
                    b = "1";
                }
                values = values + b + ","

            } else {
                values = values + "'" + obj[k] + "',"
            }

        }
        fields = fields.slice(0, -1);
        values = values.slice(0, -1);
        var sql = "INSERT INTO " + prefix + table + '(' + fields + ') VALUES(' + values + ')';
        console.log(sql + '--------------');
        db.query(sql, callback);
    }
    /**
    sets is object；
    where is object;
    */
var update = function(table, sets, where, callback) {
    var _SETS = '';
    var _WHERE = '';
    var keys = '';
    var values = '';
    for (var k in sets) {
        if (sets[k] == "b'0'" || sets[k] == "b'1'") {
            var b = "0";
            if (sets[k] == "b'1'") {
                b = "1";
            }

            _SETS += k + "=" + b + " ,";
        } else {
            _SETS += k + "='" + sets[k] + "',";
        }

    }
    _SETS = _SETS.slice(0, -1);
    for (var k2 in where) {
        _WHERE += k2 + "='" + where[k2] + "'  " + " AND ";
    }

    _WHERE = _WHERE + " 1=1 "
        //console.log(_WHERE+'--------------');
        //update table set username='admin2',age='55'   where id="5";
    var sql = "UPDATE " + prefix + table + ' SET ' + _SETS + '  WHERE ' + _WHERE;
    //console.log(sql + '--------------');
    db.query(sql, callback);
}
var del = function(table, where, callback) {
    var _WHERE = '';
    for (var k2 in where) {
        _WHERE += k + "='" + where[k2] + "' AND ";
    }
    var sql = "DELETE  FROM " + prefix + table + '  ' + _WHERE;
}

module.exports = {
    db: db,
    insert: insert,
    select: select,
    findOne: findOne,
    del: del,
    update: update,
    query: query
};
