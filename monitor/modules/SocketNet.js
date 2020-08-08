var net = require("net");
var domain = require('domain');
var protobuf = require('pomelo-protobuf');
var logger = require('pomelo-logger').getLogger('pomelo');
var Connection = require('./Connection');
var MsgProtobuf = require('./MsgProtobuf');
var ProtocolMan = require('./ProtocolMan');
var Random = require('../app/common/Random');

var SocketNet = function() {
    this.service = null;
};

SocketNet.prototype.start_server = function(obj, cb) {
    var self = this;
    var socket_server;
    var socketClient = new Connection({"socket" : null});

    if(obj) {
        for(var key in obj) {
            (function(k){
                var info = obj[k];
                if(typeof info.handler === "object") {
                    if(info.is_server == 1) {
                        socket_server = net.createServer(function(sock) {
                            var d = domain.create();
                            d.on('error', function (err) {
                                logger.error("catch domain exception:" + err.stack);
                                netErr();
                            });
                            d.add(sock);
                            sock.c_ip= sock.remoteAddress;
                            sock.c_port= sock.remotePort;
                            var _connection = new Connection({
                                "c_ip" : sock.c_ip,
                                "c_port" : sock.c_port,
                                "socket" : sock
                            });
                            _connection.on('data',onReceivePackData);
                            _connection.on('close',onCloseConnection);

                            //当服务端收到完整的包时
                            function onReceivePackData(msgheader, buffer) {
                                try {
                                    let ret = false;
                                    if(info.handler["___transmit___"]) { // 转发消息
                                        ret = info.handler["___transmit___"].handle(_connection, msgheader, buffer);
                                    }
                                    if (!ret) { // 单独处理消息
                                        var protocolFunc = ProtocolMan.getInstance().getProtocol(msgheader._type);
                                        if (!protocolFunc) {
                                            logger.error("unrecognize proto _type %d", msgheader._type);
                                        } else {
                                            logger.debug("begin execute proto _type %d", msgheader._type);
                                            //var protocol = new protocolFunc();
                                            protocolFunc.execute(_connection, msgheader, buffer);
                                        }
                                    }
                                } catch(err) {
                                    logger.error("handle msg failed, err stack : " + err.stack);
                                    netErr();
                                }
                            }

                            function netErr(){
                                let protoNameSpace = MsgProtobuf.getInstance().Messages('SysProto');
                                let sndData = {
                                    msgid : protoNameSpace.MsgID.ErrInfo_Notify,
                                    errcode : 1
                                }
                                let protoMsg = protoNameSpace.ErrInfo.create(sndData);
                                let __bytes = protoNameSpace.ErrInfo.encode(protoMsg).finish();
                                _connection.sendMessage(protoMsg.msgid, __bytes);
                                sock.emit("c_close");
                            }

                            //当数据异常关闭客户端连接时
                            function onCloseConnection(buffer){
                                logger.error('数据异常关闭客户端连接!');
                                sock.emit("c_close");
                            }

                            sock.on("data",function(data){
                                _connection.onData(data);
                            });

                            sock.on("error",function(e){
                                logger.error("socket unknow err :" + e);
                                sock.emit("c_close");
                            });

                            sock.on("c_close",function(){
                                /* 处理一次即可 sock.end(); 触发close事件 sock.on("close", ..) 中处理断开连接逻辑
                                if(info.handler["___close___"])
                                    info.handler["___close___"].handle(_connection);
                                */
                                sock.end();
                                sock.destroy();
                            });

                            sock.on("close",function(e){
                                if(info.handler["___close___"])
                                    info.handler["___close___"].handle(_connection);
                                if(!sock.destroyed) {
                                    sock.end();
                                    sock.destroy();
                                }
                            });

                            if(info.handler["___connect___"])
                                info.handler["___connect___"].handle(_connection);

                            //超过60s未发心跳包 断开连接
                            sock.setTimeout(1*60*1000);
                            sock.addListener("timeout",function(){
                                logger.debug("socket timeout, ip:"+sock.c_ip+",port:"+sock.c_port);
                                sock.emit("c_close");
                            });
                        });

                        setInterval(function(){socket_server.getConnections(function(err,count){
                            if(!err){logger.debug("server_count:"+count );}
                        })},15*60*1000);

                        socket_server.listen(info.serverport,function(){
                            logger.debug("listen on port: " + info.serverport + " ok!");
                        });
                    } else {
                        socketClient.on('data',onReceivePackData);
                        socketClient.on('close',onCloseConnection);

                        //当客户端收到完整的包时
                        function onReceivePackData(msgheader, buffer){
                            try {
                                let ret = false;
                                if(info.handler["___transmit___"]) { // 转发消息
                                    ret = info.handler["___transmit___"].handle(msgheader, buffer);
                                }
                                if (!ret) { // 单独处理消息
                                    let protocolFunc = ProtocolMan.getInstance().getProtocol(msgheader._type);
                                    if (!protocolFunc) {
                                        logger.error("unrecognize proto _type %d", msgheader._type);
                                    } else {
                                        logger.debug("begin execute proto _type %d", msgheader._type);
                                        //let protocol = new protocolFunc();
                                        protocolFunc.execute(socketClient, msgheader, buffer);
                                    }
                                }
                            } catch(err) {
                                logger.error("handle msg failed, err stack : " + err.stack);
                                netErr();
                            }
                        }

                        function netErr(){
                            let protoNameSpace = MsgProtobuf.getInstance().Messages('SysProto');
                            let sndData = {
                                msgid : protoNameSpace.MsgID.ErrInfo_Notify,
                                errcode : 1
                            }
                            let protoMsg = protoNameSpace.ErrInfo.create(sndData);
                            let __bytes = protoNameSpace.ErrInfo.encode(protoMsg).finish();
                            socketClient.sendMessage(protoMsg.msgid, __bytes);
                            socketClient.socket.emit("c_close");
                        }

                        //当数据异常关闭客户端连接时
                        function onCloseConnection(buffer){
                            logger.error('数据异常关闭客户端连接!');
                            socketClient.socket.emit("c_close");
                        }

                        function connectserver(){
                            var _socket = net.connect(info.serverport,info.serverip, function(){
                                _socket.on("data",function(data){
                                    socketClient.onData(data);
                                });

                                _socket.on("error",function(e){
                                    logger.error("socket unknow err : " + e);
                                    _socket.emit("c_close");
                                });

                                _socket.on("c_close",function(){
                                    _socket.end();
                                    _socket.destroy();
                                    socketClient.setConnctStatus(false);
                                });

                                _socket.on("close",function(e){
                                    if(info.handler["___close___"])
                                        info.handler["___close___"].handle(_socket);
                                    if(!Boolean(_socket.destroyed)) {
                                        _socket.end();
                                        _socket.destroy();
                                    }
                                    socketClient.setConnctStatus(false);
                                });

                                if(info.handler["___connect___"])
                                    info.handler["___connect___"].handle(_socket);

                                socketClient.socket = _socket;
                                socketClient.setConnctStatus(true);
                            })
                        }
                        //connectserver();
                        setInterval( function() {
                            if(info.retry && !Boolean(socketClient.getConnctStatus())) {
                                connectserver();
                            } else if (socketClient.getConnctStatus()) {
                                let _now = Date.now();
                                if (_now - socketClient.getHeartBeatTime() > 0/*10*1000*/) {
                                    if(info.handler["___heartbeat___"])
                                        info.handler["___heartbeat___"].handle();
                                    socketClient.setHeartBeatTime(_now);
                                }
                            }
                        },5*1000/*3*1000*/); // 每3s检测一次 30s发一次心跳包
                    }
                }
            })(key);
        }
    } else {
        logger.error("-- start no handler server -- ");
    }

    if(socket_server) {
        self.service = socket_server;
    } else if (socketClient) {
        self.service = socketClient;
    }

    if(cb) {
        cb(self.service);
    }
};

module.exports = SocketNet;