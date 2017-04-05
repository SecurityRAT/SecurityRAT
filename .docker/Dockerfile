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
	gksu \
	sed \
	mysql-server \
	apache2 && \

	# install apache modules
	a2enmod proxy proxy_http ssl headers && \

	# generating certificate for web server.
	openssl genrsa -out /etc/ssl/private/apache.key 2048 && \
	openssl req -new -x509 -key /etc/ssl/private/apache.key -days 365 -sha256 -subj "/C=DE/ST=unknown/L=unknown/O=unknown/CN=localhost" -out /etc/ssl/certs/apache.crt && \

	cd /home/securityrat && \

	# cloning repositories and packaging with maven
	su -c "git clone https://github.com/SecurityRAT/Security-Requirements.git" securityrat && \

	apt-get remove --purge -y \
	git \
	apt-utils && \

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
	su -c "mkdir -p /home/securityrat/SecurityRATProd" securityrat && \
	rm -rf \
	/home/securityrat/.cache/

COPY docker-entrypoint.sh /usr/local/bin/
COPY 000-default.conf /etc/apache2/sites-available/
COPY securityRAT*.tar.gz /home/securityrat/SecurityRATProd/

# exposes ports 
EXPOSE 9002
CMD ["docker-entrypoint.sh"]
