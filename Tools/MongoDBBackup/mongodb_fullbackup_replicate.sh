#!/bin/bash 
dat=`date "+%Y-%m-%d_%H:%M"`
day=`date "+%Y/%m/%d" -d now`
#localip=`ip a | grep "\binet\b" |awk '{print $2}'| egrep -e "^10|172" | awk -F"/" '{print $1; exit;}'`
basedir="/data/MongoDBBackup/$day"
logdir="/data/monitor/Tools/log"
[ ! -d $logdir ] && mkdir -p $logdir
log="$logdir"/"$(date "+%Y-%m-%d" -d now)".log
touch $log

helpfunc(){
        echo
        echo "options:"
        echo " -H      specify the hostname"
        echo " -U      specify the username"
        echo " -P      specify the pass word"
        echo " -D      specify the databases"
        echo " is running like mongodb_fullbackup_replicate.sh -H 10.0.3.252:36019 -U root -P sincetimes6 -D DGSvr_1,DGSvr_2"
}

while getopts "H:U:P:D:" Option
do
        case $Option in
                H) hostname=$OPTARG;;
                U) usrname=$OPTARG;;
                P) passwd=$OPTARG;;
                D) dbname=$OPTARG;;
                *) helpfunc; exit 1; ;;
        esac
done

dbname=`echo $dbname | sed 's/,/ /g'`
dobackup(){
    for i in ${dbname[@]}
    #也可以写成for element in ${array[*]}
    do
        echo "at $dat to do bakcup for mongodb $i"
        mkdir -p "$basedir"
        #mongodump -u$bacuser -p$pswd --port $i --oplog  -o "$basedir"/mongo"$i"
        #if /data/mongodb/bin/mongodump -h 192.168.2.142 --port $ports -d $i --oplog -o "$basedir"/"$i"_$dat;then
        #if /data/mongodb/bin/mongodump -h 192.168.2.142 --port $ports -d $i -o "$basedir"/"$i"_$dat;then
	/data/mongodb4.2.9/bin/mongodump --host $hostname -u "$usrname" -p "$passwd" --authenticationDatabase "admin" -d $i -o "$basedir"/"$i"_$dat >> $log
        if [ $? -eq 0 ];then
                echo "Mongo Backup($i) -->Sucess"
        else
                echo "Mongo Backup($i) -->faild"
        fi
    done
}

check(){
person=`whoami`
:<<!
        if [ "$person" != "root" ]; then
                echo "the user is now $person, checkout to 'root' to continue"
                exit 1
        fi
!
        if [ -z "$hostname" ] ;then
                helpfunc
                exit 1
        fi

        if [ -z "$dbname" ] ;then
                helpfunc
                exit 1
        fi
 
}

cleanbackup(){
rmdate=`date "+%Y/%m/%d" -d "7 days ago"`
if [ -d $1 ] ;then
        rm -rf $1
        echo "rm -$1"
elif [ -d $basedir/$rmdate ] ;then
        rm -rf $basedir/$rmdate
        echo "rm -rf $basedir/$rmdate"
else
        rm -rf $basedir/mongo$1
        echo "rm -rf $basedir/mongo$1"
        exit 1
fi
}

main(){
    check
    dobackup
}
main

