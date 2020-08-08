/**
 * Created by bayilaoye on 10/4/17.
 */
var AckMsgHeader = require('./AckMsgHeader');

 
var GlobalProto = (function () {
    var instance = null;

    function createInstance() {
        var MAX_MSG_LENGTH = 16*1024;
        var msgHeader = new AckMsgHeader().bigEndian();
        var dataBuffer = new Buffer(MAX_MSG_LENGTH);

        return {
            maxMsgLength() {
                return MAX_MSG_LENGTH;
            },

            msgHeader() {
                return msgHeader;
            },

            dataBuffer() {
                return dataBuffer;
            }
        };
    }

    return {
        Instance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = GlobalProto;