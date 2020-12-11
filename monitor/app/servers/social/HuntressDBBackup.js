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
        let dbs = 'DGSvr_1,DGSvr_2,DGSvr_3';
	
        const exec = require('child_process').execFile;
        //exec('../Tools/MongoDBBackup/mongodb_fullbackup_replicate.sh', [ '-H', '10.0.3.252:36019', '-U', 'root', '-P', 'sincetimes6', '-D', 'DGSvr_1,DGSvr_2' ], function(err) {
        exec('../Tools/MongoDBBackup/mongodb_fullbackup_replicate.sh', [ '-H', host, '-U', usrname, '-P', passwd, '-D', dbs ], function(err) {
            if (err) {
                logger.error('----------------- exec backup db err: ' + err);
            } else {
		logger.info('----------------- exec backup db success.');
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

