var CronJob = require('cron').CronJob;
var logger = require('pomelo-logger').getLogger('pomelo');

var PersistentDBMan = function(app, opts) {
    this.app = app;
};

PersistentDBMan.prototype.start = function(cb) {
    process.nextTick(cb);
};

PersistentDBMan.prototype.persistentByMinute = function() {
    PersistentDaoHelper.persistendDailySlotState();
};

PersistentDBMan.prototype.afterStart = function(cb) {
    var self = this;
    var minuteJob = new CronJob("0 * * * * *", function() {
        let _now = Date.now();
        logger.warn('----------------- req.headers: ' + _now);
    });
    minuteJob.start();

    process.nextTick(cb);
};

PersistentDBMan.prototype.stop = function(force, cb) {
    process.nextTick(cb);
};

module.exports = function(app, opts) {
    return new PersistentDBMan(app, opts);
};

