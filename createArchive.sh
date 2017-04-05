#!/bin/bash

set -e

DIR="target/config"
mkdir -p $DIR

cp src/main/resources/config/application.yml $DIR
cp src/main/resources/config/application-prod.yml $DIR
cp src/main/resources/config/application-dev.yml $DIR

cd target/

zip $(echo $NAME).zip $(echo $WAR_FILE) config/*
tar -czf $(echo $NAME).tar.gz $(echo $WAR_FILE) config/*

