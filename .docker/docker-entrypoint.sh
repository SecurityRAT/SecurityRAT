#!/bin/bash

set -e

MYSQL_ROOT_PASSWORD="$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})"

KEYSTORE_SECURITYRAT_PASSWORD="$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})"

DATABASE_NAME="securityrat"

target="/home/securityrat/SecurityRATProd"

cd $target

keytool -genkey -alias tomcat -storetype PKCS12 -keyalg RSA -keysize 2048 -keystore keystore.p12 -validity 3650 -storepass "$(echo $KEYSTORE_SECURITYRAT_PASSWORD)" -dname "CN=localhost, OU=unknown, O=unknown, L=unknown, S=unknown, C=unknown" -keypass "$(echo $KEYSTORE_SECURITYRAT_PASSWORD)"
certLocation="$(find / -name "cacerts" | grep java-8)"
keytool -import -trustcacerts -noprompt -file /etc/ssl/certs/apache.crt -keystore "$(echo $certLocation)" -storepass "changeit"

#Changes the keystore password and mysql root password accordingly in the security rat configuration file
sed -i "s/key-store-password:.*\$/key-store-password: $(echo $KEYSTORE_SECURITYRAT_PASSWORD)/" $target/config/application-dev.yml
sed -i "s/^\([[:blank:]]*\)password:.*/\1password: $(echo $MYSQL_ROOT_PASSWORD)/g" $target/config/application-dev.yml
sed -i "s/^\([[:blank:]]*\)type:.*/\1type: FORM/g" $target/config/application.yml

mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql &>/dev/null &

# set the root password
/etc/init.d/mysql stop &>/dev/null &&
echo "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('$MYSQL_ROOT_PASSWORD');" >> /home/mysql-init
chown mysql:mysql /home/mysql-init
mysqld_safe --init-file=/home/mysql-init &> /dev/null &
sleep 20
rm /home/mysql-init
/etc/init.d/mysql start &

#create the securityrat database 
mysql -u "root" "-p$MYSQL_ROOT_PASSWORD" << EOF
	create database $DATABASE_NAME;
EOF

/etc/init.d/apache2 restart &>/dev/null &&

echo
echo
echo -n "STARTING SECURITYRAT ."

while true;
do
	mysql -u "root" "-p$MYSQL_ROOT_PASSWORD" -e "select 1 from CONFIGCONSTANT" "$DATABASE_NAME" 2> /dev/null | grep 1 > /dev/null && {
		mysql -u "root" "-p$MYSQL_ROOT_PASSWORD" "$DATABASE_NAME" < "/home/securityrat/Security-Requirements/requirements.sql" &> /dev/null
		sleep 60
		echo
		echo
		echo "SECURITYRAT IS NOW RUNNING. GO TO https://localhost:9002"
		break		
	}
	echo -n '.'
	sleep 1
done &

rm -rf $target/Security-Requirements/

cd $target
su -m -c "java -jar $(ls | egrep .*\.war$) --spring.profiles.active=dev --1> app.log" securityrat
