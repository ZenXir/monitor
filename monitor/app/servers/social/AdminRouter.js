"use strict";
/**
 * Created by bayilaoye on 10/4/2018.
 */

var session = require('express-session');
var cookieParser = require('cookie-parser');
var express = require('express');
var router = express.Router();
//var AdminUserDao = require('../../common/dao/AdminUserDao');
//var AdminApi = require('./AdminApi');
var logger = require('pomelo-logger').getLogger('pomelo');
//var SubjectQueryType = req//uire('../enum/SubjectQueryType');

router.use(cookieParser('erase fox'));
router.use(session({ secret: 'erase fox', resave: false, saveUninitialized: true }));

var urlRoot = "";
var http = require('http');
var options = {
    hostname: '192.168.2.142',
    port: 8001,
    path: '/cmdmanagerplanet',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
};

router.all('*', function(req, res, next) {
    urlRoot = req.headers.url_root || "";
    next();
    //if (req.headers['x-forwarded-proto'] != 'https') {
    //    var host = req.headers.host;
    //    if (host.indexOf(':') > 0) {
    //        host = host.slice(0, host.indexOf(':'));
    //    }
    //    res.redirect('https://' + host + req.headers.original_url);
    //} else {
    //    next();
    //}
});

router.get('/login', function(req, res) {
    res.render('admin/login');
});

router.get('/welcome', function(req, res) {
    return res.render("admin/mytable", {error : "Welcome!"});
});

router.post('/login', function(req, res, next) {
    logger.info("In admin/login, user: %s, password:%s", req.body.username, req.body.password);

    var adminlist = {
        "jiangyong": "jiangyong",
        "yangjinzhi": "yangjinzhi",
        "chencheng": "chencheng",
        "lizhuoxi": "lizhuoxi",
        "guohuan": "guohuan",
        "zhaohaosheng" : "zhaohaosheng",
        "jiayang": "jiayang",
        "wangwenda" : "wangwenda",
        "wangrui" : "wangrui",
        "gaoyuepeng" : "gaoyuepeng",
        "fengbotao" : "fengbotao",
        "zhengmanlou" : "zhengmanlou",
        "sunmurui" : "sunmurui",
        "admin" : "admin"
    };
    
    // 这两行是临时代码
    //req.session.user = req.body.username;
    //res.redirect(urlRoot + '/admin/');
    
    if (req.body.username && req.body.password) {
        //var adminUserDao = AdminUserDao.getDao();
        //adminUserDao.getPasswordForUser(req.body.username).then(function(pwd) {
            var pwd = adminlist[req.body.username];
            if (!Boolean(adminlist[req.body.username]) || !Boolean(pwd)) {
                logger.error("can not find pwd for admin user " + req.body.username);
                //return next("InvalidUser");
                res.redirect(urlRoot + '/admin/login');
            } else if (pwd != req.body.password) {
                logger.error("admin user " + req.body.username + " password wrong");
                //return next("WrongPassword");
                res.redirect(urlRoot + '/admin/login');
            } else {
                req.session.user = req.body.username;
                res.redirect(urlRoot + '/admin/');
            }
        //});
    } else {
        res.redirect(urlRoot + '/admin/login');
    }
});

var checkAuth = function(req, res, next) {
    logger.info("In checkAuth %s query %s", req.path, JSON.stringify(req.query));
    if (req.session.user) {
        next();
    } else {
        res.redirect(urlRoot + '/admin/login');
    }
};

router.all('*', checkAuth);

router.post('/logout', function(req, res) {
    delete req.session.user;
    res.redirect(urlRoot + '/admin/login');
});

router.get('/', function(req, res) {
    var params = { text: "Slots admin"};
    res.render('admin/index', params);
});

router.get('/queryplayer', function(req, res) {
    logger.info("query player " + JSON.stringify(req.query));
    if (req.query.queryType === "QueryByFacebookId" || req.query.queryType === "QueryByUdid") {
        //AdminApi.getPlayerByUdid(req.query.id, function(err, player) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify([player])});
        //});
    } else if (req.query.queryType === "QueryByFbName") {
        //AdminApi.getPlayerByFbName(req.query.id, function(err, players) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(players)});
        //});
    } else {
        //AdminApi.getPlayerByPid(req.query.id, function(err, player) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify([player])});
        //});
    }
});

router.get('/reloadconfigs', function(req, res) {
    //AdminApi.reloadConfigs(req.query.configType, function(err) {
        return res.render("admin/mytable", { error: err });
    //});
});

router.get('/whitelist', function(req, res) {
    logger.debug(JSON.stringify(req.query))
    //AdminApi.operWhiteList(req.query.opertype, req.query.uids, function(resultlist) {
        var resultArray = [];
        for (var key in resultlist) {
            resultArray.push(key);
        }
        return res.render("admin/mytable", { error: JSON.stringify(resultArray) });
    //});
});

router.get('/logincontrol', function(req, res) {
    //AdminApi.setAllowLogin(req.query.allowLogin, req.query.reason, function(err) {
        return res.render("admin/mytable", { error: err });
    //});
});

router.get('/slotssimulate', function(req, res) {
    res.setTimeout(0);
    logger.info("slotssimulate " + JSON.stringify(req.query));
    //AdminApi.slotsSimulate(req.query, function(err, stats) {
        return res.render("admin/mytable", { error: err, tableContent: JSON.stringify(stats)});
    //});
});

router.get('/tasksimulate', function(req, res) {
    res.setTimeout(0);
    logger.info("tasksimulate " + JSON.stringify(req.query));
    //AdminApi.taskSimulate(req.query, function(err, stats) {
        return res.render("admin/mytable", { error: err, tableContent: JSON.stringify(stats)});
    //});
});

router.get('/subjectquery', function(req, res) {
    /*
    logger.info("subjectquery " + JSON.stringify(req.query));
    if (req.query.queryType === SubjectQueryType.DownloadProbTable) {
        //AdminApi.downloadProbTable(req.query.isTest, req.query.subjectId, function (err, output) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(output)});
        //});
    } else if (req.query.queryType === SubjectQueryType.QuerySymbols) {
        //AdminApi.querySubjectSymbols(req.query.subjectId, function(err, output) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(output)});
        //});
    } else if (req.query.queryType === SubjectQueryType.QuerySubjectName){
        //AdminApi.querySubjectName(req.query.subjectId, function(err, output) {
            return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(output)});
        //});
    } else {
        return res.render('admin/mytable', {error:'invalid subject query type '+req.query.queryType});
    }
    */
});

router.get('/systemmessage', function(req, res) {
    logger.info("systemmessage " + JSON.stringify(req.query));
    //AdminApi.systemMessage(req.query.msgStr, req.query.minutes, function(err) {
        return res.render("admin/mytable", { error: err });
    //});
});

router.get('/openshopdiscount', function(req, res) {
    logger.info("openshopdiscount " + JSON.stringify(req.query));
    //AdminApi.setShopDiscountTime(req.query.begin, req.query.end, req.query.ccbi, req.query.discountVer, function(err) {
        return res.render("admin/mytable", {error: err});
    //});
});

router.get('/restartserver', function(req, res) {
    logger.info("restartserver " + JSON.stringify(req.query));
    //AdminApi.restartServer(function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

router.get('/changeservertime', function(req, res) {
    logger.info("changeservertime " + JSON.stringify(req.query));
    //AdminApi.changeServerTime(req.query.time, function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

router.get('/downloadtasktable', function(req, res) {
    logger.info("downloadtasktable " + JSON.stringify(req.query));
    //AdminApi.downloadTaskTable(req.query.isTest, function(err, output) {
        return res.render("admin/mytable", { error: err, tableContent: JSON.stringify(output)});
    //});
});

router.get('/changeserverconfig', function(req, res) {
    logger.info("changeserverconfig " + JSON.stringify(req.query));
    //AdminApi.changeServerConfig(req.query, function(err) {
        return res.render("admin/mytable", { error: err });
    //});
});

router.get('/restartgameserver', function(req, res) {
    logger.info("restartgameserver " + JSON.stringify(req.query));
    var post_data = {};
    var content = JSON.stringify(post_data);

    //const exec = require('child_process').execSync;
    const exec = require('child_process').exec;
    exec('../Tools/restart_server.sh', function(err, stdout, stderr) {
        var output = [];
        if (err) {
            output.push({"err : ": JSON.stringify(err)});
        }
        if (stderr) {
            stderr.split('\n').forEach(function(line) {
                output.push({"stderr : ": line});
            })
        }
        if (stdout) {
            stdout.split('\n').forEach(function(line) {
                if (line.length > 0)
                    output.push({"Success : ": line});
            })
        }
        logger.info("restartgameserver result : " + JSON.stringify(output));
        return res.render("admin/mytable", {error: (err?"Failed : "+err:err), tableContent: JSON.stringify(output)});
    });
});

router.get('/updateconfigures', function(req, res) {
    logger.info("updateconfigures " + JSON.stringify(req.query));
    var post_data = {};
    var content = JSON.stringify(post_data);
    
    const exec = require('child_process').exec;
    exec('../Tools/update_table.sh', function(err, stdout, stderr) {
        var output = [];
        if (err) {
            output.push({"err : ": JSON.stringify(err)});
        }
        if (stderr) {
            stderr.split('\n').forEach(function(line) {
                output.push({"stdinfo: ": line});
            })
        }
        if (stdout) {
            stdout.split('\n').forEach(function(line) {
                if (line.length > 0)
                    output.push({"Success : ": line});
            })
        }
        logger.info("updateconfigures result : " + JSON.stringify(output));
        return res.render("admin/mytable", {error: (err?"Failed : "+err:err), tableContent: JSON.stringify(output)});
    });
});

router.get('/restartexternalgameserver', function(req, res) {
    logger.info("restartexternalgameserver " + JSON.stringify(req.query));
    var post_data = {};
    var content = JSON.stringify(post_data);

    //const exec = require('child_process').execSync;
    const exec = require('child_process').exec;
    exec('../Tools/restart_server_for_external_test_server.sh', function(err, stdout, stderr) {
        var output = [];
        if (err) {
            output.push({"err : ": JSON.stringify(err)});
        }
        if (stderr) {
            stderr.split('\n').forEach(function(line) {
                output.push({"stderr : ": line});
            })
        }
        if (stdout) {
            stdout.split('\n').forEach(function(line) {
                if (line.length > 0)
                    output.push({"Success : ": line});
            })
        }
        logger.info("restartexternalgameserver result : " + JSON.stringify(output));
        return res.render("admin/mytable", {error: (err?"Failed : "+err:err), tableContent: JSON.stringify(output)});
    });
});

router.get('/updateexternalconfigures', function(req, res) {
    logger.info("updateexternalconfigures " + JSON.stringify(req.query));

    if ("" == req.query.configfilename) {
        logger.error("configure file name is nil.");
        return res.render("admin/mytable", {error: "configure file name is nil."});
    }
    
    const exec = require('child_process').execFile;
    exec('../Tools/update_table_for_external_test_server.sh', [ req.query.configfilename ], function(err, stdout, stderr) {
        var output = [];
        if (err) {
            output.push({"err : ": JSON.stringify(err)});
        }
        if (stderr) {
            stderr.split('\n').forEach(function(line) {
                output.push({"stdinfo: ": line});
            })
        }
        if (stdout) {
            stdout.split('\n').forEach(function(line) {
                if (line.length > 0)
                    output.push({"Success : ": line});
            })
        }
        logger.info("updateexternalconfigures result : " + JSON.stringify(output));
        return res.render("admin/mytable", {error: (err?"Failed : "+err:err), tableContent: JSON.stringify(output)});
    });
});

router.get('/syncversionconf', function(req, res) {
    logger.info("syncversionconf " + JSON.stringify(req.query));

    if ("" == req.query.syncversion) {
        logger.error("syncversion is nil.");
        return res.render("admin/mytable", {error: "syncversion is nil. please input it!"});
    }

    const exec = require('child_process').execFile;
    exec('../Tools/update_table_specific.sh', [ req.query.syncversion ], function(err, stdout, stderr) {
        var output = [];
        if (err) {
            output.push({"err : ": JSON.stringify(err)});
        }
        if (stderr) {
            stderr.split('\n').forEach(function(line) {
                output.push({"stdinfo: ": line});
            })
        }
        if (stdout) {
            stdout.split('\n').forEach(function(line) {
                if (line.length > 0)
                    output.push({"Success : ": line});
            })
        }
        logger.info("syncversionconf result : " + JSON.stringify(output));
        return res.render("admin/mytable", {error: (err?"Failed : "+err:err), tableContent: JSON.stringify(output)});
    });
});

router.get('/queryserverinfo', function(req, res) {
    logger.info("queryserverinfo" + JSON.stringify(req.query));

    var post_data = {
        type: "queryserverinfo",
    };
    var content = JSON.stringify(post_data);


    var req = http.request(options, function (resdata) {
        console.log('STATUS: ' + resdata.statusCode);
        console.log('HEADERS: ' + JSON.stringify(resdata.headers));
        resdata.setEncoding('utf8');
        resdata.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            let serversInfo = JSON.parse(chunk)
            let output = [];
            serversInfo.forEach(function(item,index) {
                output.push({"Success : ": JSON.stringify(item)});
            });
            logger.info("query servers info : %s", JSON.stringify(output));
            return res.render("admin/mytable", {error: null, tableContent : JSON.stringify(output)});
        });
    });

    req.on('error', function (e) {
        logger.error('problem with request: ' + e.message);
    });
    // write data to request body
    req.write(content);
    req.end();
});

function isString(obj){ //靠靠靠靠靠  
    return Object.prototype.toString.call(obj) === "[object String]";  
}
function getJsonObjValue(jsonObj, out){
    for(var key in jsonObj){
        var val = jsonObj[key];
        if(isString(val) || !isNaN(val)){
            out.push(val);
        }else{
            getJsonObjValue(val, out);
        }
    }   
}
function getJsonObjKey(jsonObj, parentKey, out){
    for(var key in jsonObj){
        var val = jsonObj[key];
        if(isString(val) || !isNaN(val)){
            out.push(parentKey+key);
        }else{
            getJsonObjKey(val, key+".", out);
        }
    }   
}

const Hexstring2btye = (str)=> {
    let pos = 0;
    let len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;
    let hexA = new Array();
    for (let i = 0; i < len; i++) {
        let s = str.substr(pos, 2);
        let v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
}
 
 
const Bytes2HexString = (b)=> {
    let hexs = "";
    for (let i = 0; i < b.length; i++) {
        let hex = b[i].toString(16);
        if (hex.length == 1) {
            hex = '0' + hex;
        }
        hexs += hex.toUpperCase();
    }
    return hexs;
}

router.get('/viewcombatreport', function(req, res) {
    logger.info("viewcombatreport" + JSON.stringify(req.query));
    var noticeInfo = `Please Input Valid Params: ["pve", "kingtower", "earthtower", "watertower", "firetower", "windtower"] USE: stageid, OTHERS USE: battleid.`;
    var combattype_keys = {
        "pve": "MainStageCombatReports",
        "pvp": "PVPCombatReports",
        "kingtower": "KingTowerCombatReports",
        "maze": "MazeCombatReports",
        "arena3v3": "Arena3V3CombatReports",
        "guildboss" : "GuildBossCombatCombatReports",
        "guildhunt": "GuildHuntCombatCombatReports",
        "earthtower" : "ElementTowerCombatReports",
        "watertower" : "ElementTowerCombatReports",
        "firetower" : "ElementTowerCombatReports",
        "windtower" : "ElementTowerCombatReports"
    };
    if (!Boolean(combattype_keys[req.query.querytype]) || (!Boolean(req.query.stageid) && !Boolean(req.query.battleid))) {
        return res.render("admin/mytable", {error: noticeInfo});
    }
    var reportskey = combattype_keys[req.query.querytype] + "_ServerId_" + req.query.serverid;
    var reportsfield = "";
    if (req.query.querytype == "pve"
        || req.query.querytype == "kingtower"
        || req.query.querytype == "earthtower"
        || req.query.querytype == "watertower"
        || req.query.querytype == "firetower"
        || req.query.querytype == "windtower") {
        reportsfield = req.query.stageid;
    } else {
        reportsfield = req.query.battleid;
    }
    if (reportsfield.length <= 0) {
        return res.render("admin/mytable", {error: noticeInfo});
    }

    var AccountsDao = require('../../common/dao/AccountsDao');
    var MsgProtobuf = require('../../../modules/MsgProtobuf');

    AccountsDao.getDao().redisClient.hget(reportskey, reportsfield, function(err, result) {
        if (result==null) {
            result = "the query combat is not exist!";
            return res.render("admin/mytable", {error: result});
        }
        var combarReportObj = JSON.parse(result)

        let protoMessages = MsgProtobuf.getInstance().MessagesRef();
        let data = Hexstring2btye(combarReportObj.MseCombatStat)
        let result_data = protoMessages.MseCombatStat.decode(data)
        logger.info("result_data: " + JSON.stringify(result_data, null, 4))//使用四个空格缩进
        var str_pretty1 = JSON.stringify(result_data, null, 4) 
        var str_pretty2 = JSON.stringify(result_data) 
        return res.render("admin/combatreport", {error: err, tableContent : str_pretty2});
    });
});

router.get('/querygateservers', function(req, res) {
    logger.info("querygateservers " + JSON.stringify(req.query));
    //AdminApi.querygateservers(function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

router.get('/deletegateserver', function(req, res) {
    logger.info("deletegateserver " + JSON.stringify(req.query));
    //AdminApi.deletegateserver(req.query, function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

router.get('/dispatchclientbydeviceid', function(req, res) {
    logger.info("dispatchclientbydeviceid " + JSON.stringify(req.query));
    //AdminApi.dispatchclientbydeviceid(req.query, function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

router.get('/queryalldispatches', function(req, res) {
    logger.info("queryalldispatches " + JSON.stringify(req.query));
    //AdminApi.queryalldispatches(function(err, result) {
        return res.render("admin/mytable", {error: err, tableContent: JSON.stringify(result)});
    //});
});

module.exports = router;
