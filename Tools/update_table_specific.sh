#!/bin/sh
find_version="No"
find_config_version="No"
version_list=($(svn list https://192.168.0.126/svn/DragonGirls/DragonGirlsServer))
len=${#version_list[@]}
for((n=0;n<$len;n++))
do
    oneline=${version_list[$n]}
    echo $oneline
    var_oneline=$oneline
    var_oneline=${var_oneline#*_}
    var_oneline=${var_oneline%_*}

    var_oneline=${var_oneline#*2021}
    if [[ $1 = $var_oneline ]];
    then
        #echo $var_oneline
        find_version="yes"
        if [ ! -d $oneline ];
        then
            svn co https://192.168.0.126/svn/DragonGirls/DragonGirlsServer/$oneline
        #else
            #echo $var_oneline
        fi
        config_version_list=($(svn list https://192.168.0.126/svn/DragonGirls/DragonGirlsConfig/正式数据表))
        config_len=${#config_version_list[@]}
        for((j=0;j<$config_len;j++))
        do
            config_onedir=${config_version_list[$j]}
            config_onedir=${config_onedir%/*}
            config_onedir=${config_onedir#*2021}
            echo $config_onedir
            if [[ $1 = $config_onedir ]];
            then
                find_config_version="yes"
                if [ ! -d $config_onedir ];
                config_onedir="2021${config_onedir}"
                then
                    svn co https://192.168.0.126/svn/DragonGirls/DragonGirlsConfig/正式数据表/$config_onedir
                fi
                cd $config_onedir/server/
                svn up
                cd ../../
                cd $oneline/Debug/Config/
                svn up
                \cp ../../../$config_onedir/server/* .
                svn add *
                svn ci -m "策划同步数据表格"
                break
            fi
        done
        break
    fi
done

if [[ $find_version = "No" || $find_config_version = "No" ]];
then
    echo "没有对应该日期的版本"
    echo "info:"
    echo "Is server version found? : " $find_version "!"
    echo "Is config version found? : " $find_config_version "!"
fi



