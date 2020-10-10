#!/bin/bash
dat=`date "+%Y-%m-%d_%H:%M"`
day=`date "+%Y/%m/%d" -d now`

helpfunc(){
        echo
        echo "options:"
        echo " -H      [Specify the host name]"
        echo " -U      specify the username"
        echo " -P      specify the pass word"
        echo " -S      [Start-BSON-Timestamp]"
        echo " -E      [End-BSON-Timestamp] "
        echo " is running like mongodb_dump_oplog_replicate.sh -H 10.0.3.252:36019 -U root -P sincetimes6 -S 1553499626 -E 1602239223"
}

if [ $# -lt 2 ] ;
    then
        helpfunc
         exit 1
else
    while getopts "H:U:P:S:E:" Option
    do
            case $Option in
                    H) hostname=$OPTARG;;
                    U) usrname=$OPTARG;;
                    P) passwd=$OPTARG;;
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
    #query='{ "ts": { "$gte": '$start_time', "$lt": '$stop_time' }}'
    #query='{ "ts": { "$gte": Timestamp('$start_t', 0), "$lt": Timestamp('$stop_t', 0)}}'
    query="{\"ts\":{\"\$gte\":{\"\$timestamp\":{\"t\":$start_t,\"i\":1}}}}"
    echo $query
    flags='-d local -c oplog.rs'
    if /data/mongodb4.2.9/bin/mongodump --host $hostname -u "$usrname" -p "$passwd" --authenticationDatabase "admin" $flags --query "$query" -o $backdir/$date_now;then
        /data/mongodb4.2.9/bin/mongoexport --host $hostname -u "$usrname" -p "$passwd" --authenticationDatabase "admin" $flags --query "$query" -o $backdir/$date_now/oplog.json
	echo "Mongo oplog backup [`date -d @${start_t} "+%Y-%m-%d %H:%M:%S"` - `date -d @${stop_t} "+%Y-%m-%d %H:%M:%S"`] -->Sucess"
    else
        echo "Mongo oplog backup [`date -d @${start_t} "+%Y-%m-%d %H:%M:%S"` - `date -d @${stop_t} "+%Y-%m-%d %H:%M:%S"`] -->Faild"
    fi
}

main(){
    data_fetch
}
main



