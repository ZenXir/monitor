var CronJob = require('cron').CronJob;
var logger = require('pomelo-logger').getLogger('pomelo');

var HuntressDBBackup = function(app, opts) {
    this.app = app;
};

HuntressDBBackup.prototype.start = function(cb) {
    process.nextTick(cb);
};

HuntressDBBackup.prototype.persistentByMinute = function() {
    PersistentDaoHelper.persistendDailySlotState();
};

HuntressDBBackup.prototype.afterStart = function(cb) {
    var self = this;
    // execute backup process at 4:30 everyday
    var dayJob = new CronJob("0 * * * * *", function() {
    //var dayJob = new CronJob("0 30 4 * * *", function() {
        let _now = Date.now()/1000;
        const exec = require('child_process').execFile;
        exec('../Tools/MongoDBBackup/mongodb_fullbackup_replicate.sh', [ -H "10.0.3.252:36019" -U "root" -P "sincetimes6" -D DGSvr_1,DGSvr_2 ], function(err) {
            if (err) {
                logger.warn('----------------- req.headers: ' + err);
            }
        });
    });
    dayJob.start();

    process.nextTick(cb);
};

HuntressDBBackup.prototype.stop = function(force, cb) {
    process.nextTick(cb);
};

module.exports = function(app, opts) {
    return new HuntressDBBackup(app, opts);
};

