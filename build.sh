#!/bin/bash
IMAGE_TYPE=$1
VERSION=2.1.1

echo "Building buddy-budget image. You have 5 seconds to stop the script"
sleep 5
docker build ./backend -f backend/Dockerfile -t buddy-budget:$VERSION
docker image push buddy-budget:$VERSION

