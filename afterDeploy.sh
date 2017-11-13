#!/bin/bash

set -e

cp target/$(echo $NAME).tar.gz .docker/
cd .docker/

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t $SECRATDOCKERREPO:$TAG_NAME .
docker tag $SECRATDOCKERREPO:$TAG_NAME $SECRATDOCKERREPO:latest
docker push $SECRATDOCKERREPO:$TAG_NAME
docker push $SECRATDOCKERREPO:latest