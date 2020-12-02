#!/bin/sh
#game_pid=`cat /home/DragonGirlServer/Debug/game_pid.pid1`
#kill -9 ${game_pid}

#game_pid=`cat /home/DragonGirlServer/Debug/game_pid.pid2`
#kill -9 ${game_pid}

game_pids=`ps -A |grep "gamed"| awk '{print $1}'`
echo ${game_pids}
kill -9 ${game_pids}
echo 'kill old game pids: {'${game_pids}'}'

#pkill gamed
sleep 1

cd /home/DragonGirlServer/Debug/
svn up
sh startgame.sh 

cd /data/DragonGirlServer_tag_20201203/Debug/
svn up
sh startgame.sh

