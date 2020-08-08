var ReqMsgHeader = function() {
    this._size =  0xFFFF;          // 消息大小
    this.flag1 =  0xEEEE;          // 预留标记1
    this._type =  0xFFFF;          // 消息号
    this.flag2 =  0xEEEE;          // 预留标记2


    this._endian = 'B';
    /*
     * 指定字节序 为Little Endian (默认：Big Endian)
     */
    this.littleEndian = function(){
        this._endian = 'L';
        return this;
    };

    /*
     * 指定字节序 为Big Endian (默认：Big Endian)
     */
    this.bigEndian = function(){
        this._endian = 'B';
        return this;
    };
};

ReqMsgHeader.prototype.peek = function(buf, _offset) {
    //this._size = buf.readUInt32LE(0);
    //this._type = buf.readUInt32LE(2);
    let varLen = 2;
    let offset = _offset || 0;
    this._size = buf['readUInt' + (8*varLen) + ''+ this._endian +'E'](offset); offset += varLen;
    this.flag1 = buf['readUInt' + (8*varLen) + ''+ this._endian +'E'](offset); offset += varLen;
    this._type = buf['readUInt' + (8*varLen) + ''+ this._endian +'E'](offset); offset += varLen;
    this.flag2 = buf['readUInt' + (8*varLen) + ''+ this._endian +'E'](offset); offset += varLen;
};

ReqMsgHeader.prototype.fill = function(buf, _offset) {
    //buf.writeUInt32(this._size, 0);
    //buf.writeUInt32(this._type, 2);
    let varLen = 2;
    let offset = _offset || 0;
    buf['writeUInt' + (8*varLen) + ''+ this._endian +'E'](this._size, offset); offset += varLen;
    buf['writeUInt' + (8*varLen) + ''+ this._endian +'E'](this.flag1, offset); offset += varLen;
    buf['writeUInt' + (8*varLen) + ''+ this._endian +'E'](this._type, offset); offset += varLen;
    buf['writeUInt' + (8*varLen) + ''+ this._endian +'E'](this.flag2, offset); offset += varLen;
};

ReqMsgHeader.prototype.size = function() {
    return 8;
};

module.exports = ReqMsgHeader;