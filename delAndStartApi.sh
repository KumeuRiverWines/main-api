#!/bin/bash
echo Stopping older docker container
id=$(docker ps --format '{{.ID}}' --filter "name=krwapi")
echo $id
#Checking is string is not empty
if ! [ -z $id ]; then
	docker kill "$id"
fi


#Checking if pull from main is needed
while getopts ":p" opt; do
	case "$opt" in
		p)
			echo Pulling main from github
			git pull origin main	
			;;
	esac
done


echo Getting old container version num
images=$(docker images --format {{.Repository}},{{.Tag}})
echo $images
latestImage=$(echo $images | tr " " "\n" | grep -m1 "kumeuapi")
IFS="," read -ra splits <<< "$latestImage"
latestNum="${splits[1]#v}"
newNum=$((latestNum + 1))
echo "Older version = $latestNum"
echo "new version = $newNum"


echo Building the new container
docker build . -t "kumeuapi:v${newNum}"

#need to sleep to let container die
sleep 5

echo Starting new server
echo $newNum
docker run -p 3000:3000 --name "krwapi$newNum" -d "kumeuapi:v${newNum}" 

echo "Finished"
