server_path=/mnt/c/Users/tony/OneDrive/Work/najigre.com
folder=/home/tony/files/najigre/
folder_serverside=/home/admin
nodeip=172.104.242.112

cd $server_path

rm -d $folder -r
mkdir $folder

cp ./app.js $folder/app.js
cp ./data.js $folder/data.js
cp ./package.json $folder/package.json
cp ./dist $folder/dist -r
cp ./locales $folder/locales -r
cp ./routes $folder/routes -r
cp ./scripts $folder/scripts -r
cp ./src $folder/src -r
rm -d $folder/src/data/games -r

if $1; then
    ssh admin@$nodeip "rm -d $folder_serverside/najigre-testing -r;"
else
    ssh admin@$nodeip "rm -d $folder_serverside/najigre -r;"
fi
if $1; then
    rsync -r $folder admin@$nodeip:$folder_serverside/najigre-testing/
    ssh admin@$nodeip "cd $folder_serverside/najigre-testing; npm install; pm2 restart app-dev;"
else
    rsync -r $folder admin@$nodeip:$folder_serverside/najigre/
    ssh admin@$nodeip "cd $folder_serverside/najigre; npm install; pm2 restart app;"
fi
rm -d $folder -r