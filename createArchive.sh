#!/bin/bash

set -e

NAME='securityRAT-1.4.0'

cd target/

mkdir config

cp ../src/main/resources/config/application.yml config/
cp ../src/main/resources/config/application-prod.yml config/

zip $(echo $NAME).zip $(echo $NAME).war config/*
tar -czf $(echo $NAME).tar.gz $(echo $NAME).war config/*