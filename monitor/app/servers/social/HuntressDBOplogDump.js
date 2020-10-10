var CronJob = require('cron').CronJob;
var logger = require('pomelo-logger').getLogger('pomelo');

var HuntressDBOplogDump = function(app, opts) {
    this.app = app;
};

HuntressDBOplogDump.prototype.start = function(cb) {
    process.nextTick(cb);
};

HuntressDBOplogDump.prototype.persistentByMinute = function() {
    PersistentDaoHelper.persistendDailySlotState();
};

HuntressDBOplogDump.prototype.afterStart = function(cb) {
    var self = this;

/*
       *                  *      *          *             *         *
       *                  *      *          *             *         *
       *                  *      *          *             *         *
Second(Optional)	Minute	Hour	Day of Month	Month	Day of Week
 */
    //var dayJob = new CronJob("0 * * * * *", function() { // execute every minute
    var dayJob = new CronJob("30 4 * * *", function() { // execute backup process at 4:30 everyday
        let _now = Date.now()/1000;
        let host = '10.0.3.252:36019';
        let usrname = 'root';
        let passwd = 'sincetimes6';
        let start_t = _now - 24 * 60 * 60;
        let stop_t = _now;
	
        const exec = require('child_process').execFile;
        exec('../Tools/MongoDBBackup/mongodb_dump_oplog_replicate.sh', [ '-H', host, '-U', usrname, '-P', passwd, '-S', start_t, , '-E', stop_t ], function(err) {
            if (err) {
                logger.error('----------------- exec dump oplog err: ' + err);
            } else {
                logger.info('----------------- exec dump oplog success. start time: ' + start_t + ' stop time: ' + stop_t);
	       }
        });
    });
    dayJob.start();

    process.nextTick(cb);
};

HuntressDBOplogDump.prototype.stop = function(force, cb) {
    process.nextTick(cb);
};

module.exports = function(app, opts) {
    return new HuntressDBOplogDump(app, opts);
};

