#!/bin/bash

set -e

DIR="securityrat-backend/target/config"
mkdir -p $DIR

cp securityrat-backend/src/main/resources/config/application.yml $DIR
cp securityrat-backend/src/main/resources/config/application-prod.yml $DIR
cp securityrat-backend/src/main/resources/config/application-dev.yml $DIR

cd securityrat-backend/target/

tar -czf $APP_NAME.tar.gz $APP_NAME.jar config/*