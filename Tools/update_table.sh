#!/bin/sh
cd /home/serverconfigurefiles/
svn up

cd /home/DragonGirlServer/Debug/Config/
svn up 

\cp /home/serverconfigurefiles/* /home/DragonGirlServer/Debug/Config/

svn add *

svn ci -m "server 表格更新" .

