#!/bin/bash
OPERATION=$1

if [ "$OPERATION" = "stop" ]; then
	echo "Removing buddy-budget stack... 5 seconds to stop"
	# sleep 5
	docker stack rm buddy-budget
else
    docker stack deploy -c docker-compose.yml buddy-budget
fi