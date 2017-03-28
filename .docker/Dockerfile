FROM ubuntu:15.04

ENV NODE_VERSION=4.x

ENV JAVA_VERSION=8

ENV DEBIAN_FRONTEND=noninteractive

# some changes.
RUN \
	# configure the securityrat user
	groupadd securityrat && \
	useradd securityrat -s /bin/bash -m -g securityrat -p securityrat -G sudo && \

	#install prerequisites and configure database and webserver.
	apt-get update && \
	apt-get install -y --no-install-recommends \
	openjdk-$JAVA_VERSION-jre openjdk-$JAVA_VERSION-jdk \
	git \
	fontconfig \
	curl \
	gksu \
	sed \
	mysql-server \
	maven \
	apache2 \
	build-essential && \

	# install node.js
	curl -sL https://deb.nodesource.com/setup_$NODE_VERSION | bash && \
	apt-get install -y nodejs && \

	# upgrade npm
	curl -L https://www.npmjs.com/install.sh | sh && \

	# install apache modules
	a2enmod proxy && \
	a2enmod proxy_http && \
	a2enmod ssl && \
	a2enmod headers && \

	# generating certificate for web server.
	openssl genrsa -out /etc/ssl/private/apache.key 2048 && \
	openssl req -new -x509 -key /etc/ssl/private/apache.key -days 365 -sha256 -subj "/C=DE/ST=unknown/L=unknown/O=unknown/CN=localhost" -out /etc/ssl/certs/apache.crt && \
	
	# installing necessary global npm packages	
	npm install -g bower grunt-cli && \

	cd /home/securityrat && \

	# cloning repositories and packaging with maven
	su -c "git clone https://github.com/SecurityRAT/SecurityRAT.git" securityrat && \
	su -c "git clone https://github.com/SecurityRAT/Security-Requirements.git" securityrat && \
	cd SecurityRAT && \
	su -c "mvn -Pprod -DskipTests package" securityrat && \

	# Cleaning up
	npm uninstall bower \
	grunt-cli -g && \

	apt-get remove --purge -y \
	fontconfig \
	curl \
	maven \
	nodejs \
	git \
	apt-utils \
	build-essential && \

	apt-get clean -y && \

	rm -rf \
	/tmp/* \
	/var/tmp/* \
	/var/lib/mysql &&  \
	mkdir -p /var/lib/mysql /var/run/mysqld && \
	chown -R mysql:mysql /var/run/mysqld && \
	chown -R mysql:mysql /var/lib/mysql && \
	chmod 777 /var/run/mysqld && \

	# preparing the application environment
	cd /home/securityrat/ && \
	su -c "mkdir -p SecurityRATProd/config" securityrat && \
	su -c "cp -r /home/securityrat/SecurityRAT/src/main/resources/config/application* SecurityRATProd/config/" securityrat && \
	su -c "cp SecurityRAT/target/*.war SecurityRATProd/" securityrat && \
	rm -rf \
	/home/securityrat/.cache/ \
	/home/securityrat/SecurityRAT/ \
	/home/securityrat/.m2/ \
	/home/securityrat/.npm/

COPY docker-entrypoint.sh /usr/local/bin/
COPY 000-default.conf /etc/apache2/sites-available/

# exposes ports 
EXPOSE 9002
CMD ["docker-entrypoint.sh"]
