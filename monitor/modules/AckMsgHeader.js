var AckMsgHeader = function() {
    this._size =  0xFFFF;          // 消息大小
    this._type =  0xFFFF;          // 消息号
    this.flag1 =  0xEEEE;          // 随机值


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

AckMsgHeader.prototype.peek = function(buf, _offset) {
    //this._size = buf.readUInt32LE(0);
    //this._type = buf.readUInt32LE(2);
    let offset = _offset || 0;
    this._size = buf['readUInt' + (8*4) + ''+ this._endian +'E'](offset); offset += 4;
    this._type = buf['readUInt' + (8*2) + ''+ this._endian +'E'](offset); offset += 2;
    this.flag1 = buf['readUInt' + (8*4) + ''+ this._endian +'E'](offset); offset += 4;
};

AckMsgHeader.prototype.fill = function(buf, _offset) {
    //buf.writeUInt32(this._size, 0);
    //buf.writeUInt32(this._type, 2);
    let offset = _offset || 0;
    buf['writeUInt' + (8*4) + ''+ this._endian +'E'](this._size, offset); offset += 4;
    buf['writeUInt' + (8*2) + ''+ this._endian +'E'](this._type, offset); offset += 2;
    buf['writeUInt' + (8*4) + ''+ this._endian +'E'](this.flag1, offset); offset += 4;
};

AckMsgHeader.prototype.size = function() {
    return 10;
};

AckMsgHeader.prototype.lengthIncludeInHeader = function() {
    return 6; // ignore the size of this._type and this.flag1, becase this._size includes the size of them, but doesn't include itself
};

module.exports = AckMsgHeader;