#!/bin/sh

mysql -u root -p"$MYSQL_ROOT_PASSWORD" securityrat < /var/requirements.sql