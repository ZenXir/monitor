#!/bin/sh
echo $1
scp -i /data/tools/huntress-keypair.pem /home/DragonGirlServer/Debug/Config/$1 ec2-user@13.112.175.77:/data/dgsvr/revision_15725/Debug/Config
