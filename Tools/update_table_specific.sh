#!/bin/sh
typeset -u target_version_type
target_version=$1
target_version_type=$2

#判定是日本版本 韩国版本 还是 中文繁体 版本
OLD_IFS="$IFS"
IFS=":"
query_type_array=($target_version_type)
IFS="$OLD_IFS"

__query_type_len=${#query_type_array[@]}
if [ $__query_type_len -ge 2 ]
then
    echo "_version_type is: "${target_version_type}
    target_version_type=${query_type_array[1]}
else
    target_version_type=""
    echo "_version_type is: japan"
fi
echo "_version is: "${target_version}

find_version="No"
find_config_version="No"
version_list=($(svn list https://192.168.0.126/svn/DragonGirls/DragonGirlsServer))
len=${#version_list[@]}
for((n=0;n<$len;n++))
do
    oneline=${version_list[$n]}
    #echo $oneline
    var_oneline=$oneline
    var_oneline=${var_oneline#*_}
    var_oneline=${var_oneline%_*}

    #var_oneline=${var_oneline#*2021}
    if [[ ${target_version}${target_version_type} = $var_oneline ]];
    then
        echo "------found server version: "$var_oneline
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
            #config_onedir=${config_onedir#*2021}
            #echo "config version item: "$config_onedir
            if [[ ${target_version} = $config_onedir ]];
            then
                echo "------found config version: "$config_onedir
                find_config_version="yes"
                if [ ! -d $config_onedir ];
                #config_onedir="2021${config_onedir}"
                then
                    svn co https://192.168.0.126/svn/DragonGirls/DragonGirlsConfig/正式数据表/$config_onedir
                fi
                
                if [ ${#target_version_type} -gt 0 ]
                then
                    # 如果是 韩国 或 繁体版本
                    # 先判断对应区域版本的目录是否存在
                    cd $config_onedir/
                    if [ ! -d ${target_version_type} ];
                    then
                        find_config_version="No"
                        break
                    fi
                    #cd $config_onedir/${target_version_type}/server/
                    cd ${target_version_type}/server/
                    svn up
                    cd ../../../
                    cd $oneline/Debug/Config/
                    svn up
                    \cp ../../../$config_onedir/${target_version_type}/server/* .
                    svn add *
                    svn ci -m "策划同步数据表格"
                else
                    # 如果是 日本版本 
                    cd $config_onedir/server/
                    svn up
                    cd ../../
                    cd $oneline/Debug/Config/
                    svn up
                    \cp ../../../$config_onedir/server/* .
                    svn add *
                    svn ci -m "策划同步数据表格"
                fi
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



