#!/bin/bash
dat=`date "+%Y-%m-%d_%H:%M"`
day=`date "+%Y/%m/%d" -d now`
#localip=`ip a | grep "\binet\b" |awk '{print $2}'| egrep -e "^10|172" | awk -F"/" '{print $1; exit;}'`
backdir="/data/MongoDBBackup/mongodb/oplog/$day"

helpfunc(){
        echo
        echo "options:"
        echo " -P      specify the port"
        echo " -p      specify the restore db path, must abspath"
        echo " is running like $0 -P 临时端口  -p $backdir/local/oplog.rs.bson"
}
 
if [ $# -lt 2 ] ;
    then
        helpfunc
         exit 1
else
    while getopts "P:p:" Option
    do
            case $Option in
                    P) port=$OPTARG;;
                    p) path=$OPTARG;;
                    *) helpfunc; exit 1; ;;
            esac
    done
fi
 
function data_restore(){
    flags='-d local -c oplog.rs'
    if /data/mongodb/bin/mongorestore --port $port $flags $path;then
        echo "Mongo restore[$port] -->Sucess"
    else
        echo "Mongo restore[$port] -->Faild"
    fi
}
data_restore



