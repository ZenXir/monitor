./bin/mongod.exe --bind_ip 0.0.0.0 --port 27019 --dbpath ./data/ --logpath ./logs/mongodb.log

node app.js env=development serverType=zgate id=zgate-server-2 host=127.0.0.1 port=7960 mode=stand-alone



pstack [pid] --查看进程线程状态