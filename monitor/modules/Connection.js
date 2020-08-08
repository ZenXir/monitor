var util = require('util');
var events = require('events');
var uuid = require('node-uuid');
var logger = require('pomelo-logger').getLogger('pomelo');
var ReqMsgHeader = require('./ReqMsgHeader');
var NetBuffer = require('./NetBuffer');
var NetDataStatus = require('./NetDataStatus');

var Connection = function(options) {
    var self = this;
    this.c_ip = options.c_ip;
    this.c_port = options.c_port;
    this.c_sessionid = options.c_sessionid || 0;
    this.connectStatus = false; // 当作为客户端连接时 标记连接状态
    this.lastHeartBeatTime = 0; // 当作为客户端连接时 标记上次心跳包时间
    this.socket = options.socket;
    this.netbuffer = new NetBuffer();

    this.on('error', options.onError || onError);
    this.setSessionId = function(clientSessionId) {
        self.c_sessionid = clientSessionId;
    }
    this.getSessionId = function() {
        return self.c_sessionid;
    }
    this.setConnctStatus = function(status) {
        this.connectStatus = status;
    }
    this.getConnctStatus = function() {
        return this.connectStatus;
    }
    this.setHeartBeatTime = function(time) {
        this.lastHeartBeatTime = time;
    }
    this.getHeartBeatTime = function() {
        return this.lastHeartBeatTime;
    }

    /***
     * Called whenever the socket receives data from the EventStore.
     * Splits the incoming data into messages, and passes each message to receiveMessage
     * @param data A Buffer containing the data received from Event Store
     */
    var msgDataLength = 0;
    this.onData = function(data) {
        self.netbuffer.push(data);
        do {
            var msg = self.netbuffer.pop();
            if (msg.datast === NetDataStatus.NDS_INVALID) {
                logger.error('Invalid message : %s', JSON.stringify(msg.header));
                self.onClose();
                break;
            }
            if (msg.datast === NetDataStatus.NDS_NONE) {
                logger.debug('none readable messages.');
                break;
            }
            if (!Boolean(msg.data)) {
                logger.warn('Invalid message length wait for next received. msginfo : %s', JSON.stringify(msg.header));
                break;
            }
            logger.debug('receive message : ' + JSON.stringify(msg.header));
            receiveMessage(msg.header, msg.data.slice(0, msg.header._size-msg.header.lengthIncludeInHeader()));
        } while(1);
    }

    /***
     * Called when the socket is closed (does nothing)
     * @param hadError true if the socket had a transmission error
     */
    this.onClose = function() {
        self.emit('close', 'msg data error.');
    }

    /***
     * Called when a socket error occurs
     * @param err The error that occurred
     */
    function onError(err) {
        self.onClose();
    }

    /***
     * Called when a complete message has arrived from the EventStore.
     * @param buf A Buffer containing a complete message
     */
    function receiveMessage(msgheader, buf) {
        self.emit("data", msgheader, buf);
    }
}

/***
 * Creates a Buffer containing a new v4 GUID
 * @returns {Buffer}
 */
Connection.createGuid = function() {
    var GUID_LENGTH = 16;
    var buffer = new Buffer(GUID_LENGTH);
    uuid.v4({}, buffer);
    return buffer;
};

/***
 * Sends a ping to the server and expects a pong response
 */
Connection.prototype.sendHeartBeat = function() {

};

Connection.prototype.sendMessage = function(command, buffer, clientSessionId) {
    var self = this;
    var _msgHeader = new ReqMsgHeader().littleEndian();
    _msgHeader._size = _msgHeader.size() + buffer.length;  // 消息头大小包含消息头本身大小
    _msgHeader._type = command;

    var _newbuffer = new Buffer(_msgHeader._size);
    _msgHeader.fill(_newbuffer);
    buffer.copy(_newbuffer, _msgHeader.size(), 0, buffer.length);

    if(self.socket.writable) {
        self.socket.write(_newbuffer);
        logger.debug('send message : ' + JSON.stringify(_msgHeader));
    } else {
        logger.error("socket write err,writable :" + self.socket.writable + ', proto info:' + JSON.stringify(_msgHeader));
        self.onClose();
    }
};

util.inherits(Connection, events); //继承事件类
module.exports = Connection;
