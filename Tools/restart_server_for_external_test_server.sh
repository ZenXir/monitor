#!/bin/bash
#ssh -i /data/tools/huntress-keypair.pem ec2-user@13.112.175.77 > /dev/null 2>&1 << EEOOFF
ssh -i /data/tools/huntress-keypair.pem ec2-user@13.112.175.77 2>&1 << EEOOFF
su - root <<ROOTEOF
sincetimes
game_pids=`ps -A |grep "gamed"| awk '{print $1}'`
echo ${game_pids}
kill -9 ${game_pids}
echo 'kill old game pids: {'${game_pids}'}'

pkill gamed
sleep 1

cd /data/dgsvr/revision_15725/Debug/
sh startgame.sh
sleep 1
exit
ROOTEOF
exit
EEOOFF
echo done!
