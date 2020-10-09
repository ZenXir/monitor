#!/bin/bash
dat=`date "+%Y-%m-%d_%H:%M"`
day=`date "+%Y/%m/%d" -d now`
#localip=`ip a | grep "\binet\b" |awk '{print $2}'| egrep -e "^10|172" | awk -F"/" '{print $1; exit;}'`
basedir="/data/MongoDBBackup/mongodb/$day"

helpfunc(){
        echo
        echo "options:"
        echo " -P      specify the port"
        echo " -D      specify the dbname"
        echo " -p      specify the restore db path, must abspath"
        echo " is running like mongoha_backup.sh -P 27019 -D DGSvr_1 -p $backdir/DGSvr_1"
}

while getopts "P:D:p:" Option
do
        case $Option in
                P) ports=$OPTARG;;
                D) dbname=$OPTARG;;
                p) path=$OPTARG;;
                *) helpfunc; exit 1; ;;
        esac
done

#mongorestore -h 192.168.2.142:27017 -d test test/
dorestore(){
        echo "at $dat to do restore for mongo $dbname"
        #if /data/mongodb/bin/mongorestore --drop --oplogReplay -h 192.168.2.142:${ports} $path;then
        if /data/mongodb/bin/mongorestore --drop -h 192.168.2.142:${ports} -d $dbname --dir $path;then
                echo "Mongo restore($dbname) -->Sucess"
        else
                echo "Mongo restore($dbname) -->faild"
        fi
}

check(){
person=`whoami`
        if [ "$person" != "root" ]; then
                echo "the user is now $person, checkout to 'root' to continue"
                exit 1
        fi
 
        if [ -z "$ports" ] ;then
                helpfunc
                exit 1
        fi
}

main(){
    check
    dorestore
}
main


