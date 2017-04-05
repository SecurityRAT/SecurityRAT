#!/bin/bash

set -e

REPO="securityrat/all_in_one"

cp target/$(echo $NAME).tar.gz .docker/
cd .docker/

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t $REPO:$TAG_NAME .
docker tag $REPO:$TAG_NAME $REPO:latest
docker push $REPO:$TAG_NAME
docker push $REPO:latest