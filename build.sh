#!/bin/bash
IMAGE_TYPE=$1
VERSION=2.2.0

echo "Building buddy-budget image. You have 5 seconds to stop the script"
sleep 5
docker build ./backend -f backend/Dockerfile -t buddy-budget-backend:$VERSION
docker image push buddy-budget-backend:$VERSION

docker build ./stocks_manager -f stocks_manager/Dockerfile -t buddy-budget-stock:$VERSION
docker image push buddy-budget-stock:$VERSION

