#!/bin/bash
dat=`date "+%Y-%m-%d_%H:%M"`
day=`date "+%Y/%m/%d" -d now`

helpfunc(){
        echo
        echo "options:"
        echo " -H      [Specify the host name]"
        echo " -S      [Start-BSON-Timestamp]"
        echo " -E      [End-BSON-Timestamp] "
        echo " is running like mongodb_dump_oplog.sh -H 192.168.2.142:27019 -S 1553499626 -E 1553499686"
}

if [ $# -lt 2 ] ;
    then
        helpfunc
         exit 1
else
    while getopts "H:S:E:" Option
    do
            case $Option in
                    H) hostname=$OPTARG;;
                    S) start_t=$OPTARG;;
                    E) stop_t=$OPTARG;;
                    *) helpfunc; exit 1; ;;
            esac
    done
fi

start_time="Timestamp(${start_t}, 0)"
stop_time="Timestamp(${stop_t}, 0)"
date_now=`date "+%Y%m%d%H%M%S" -d now`
backdir="/data/MongoDBBackup/oplog"

#dump
function data_fetch(){
    mkdir -p $backdir
    query='{ts:{$gt:'$start_time',$lt: '$stop_time' }}'
    flags='-d local -c oplog.rs'
    if /data/mongodb/bin/mongodump --host $hostname $flags --query "$query" -o $backdir/$date_now;then
        echo "Mongo oplog backup [`date -d @${start_t} "+%Y-%m-%d %H:%M:%S"` - `date -d @${stop_t} "+%Y-%m-%d %H:%M:%S"`] -->Sucess"
    else
        echo "Mongo oplog backup [`date -d @${start_t} "+%Y-%m-%d %H:%M:%S"` - `date -d @${stop_t} "+%Y-%m-%d %H:%M:%S"`] -->Faild"
    fi
}

main(){
    data_fetch
}
main



