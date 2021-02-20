#!/bin/bash

set -e

DIR="securityrat-backend/target/config"
mkdir -p $DIR

cp securityrat-backend/src/main/resources/config/application.yml $DIR
cp securityrat-backend/src/main/resources/config/application-prod.yml $DIR
cp securityrat-backend/src/main/resources/config/application-dev.yml $DIR

cd securityrat-backend/target/

zip $(echo $NAME).zip $(echo $JAR_FILE) config/*
tar -czf $(echo $NAME).tar.gz $(echo $JAR_FILE) config/*