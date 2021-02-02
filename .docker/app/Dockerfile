FROM openjdk:11-jre

ENV COMPRESSEDFILE="securityrat*.tar.gz"

ENV JHIPSTER_SLEEP 0

RUN addgroup securityrat && \
	useradd --shell /bin/sh --home /home/securityrat -g securityrat securityrat

COPY securityrat*.tar.gz /home/securityrat/

WORKDIR /home/securityrat

#Changes the mysql root password accordingly in the application config files
RUN tar -xzf $COMPRESSEDFILE && chown securityrat:securityrat -R . && \
	sed -i "s/^\([[:blank:]]*\)type:.*/\1type: FORM/g" config/application.yml && \
	sed -i "s/^\([[:blank:]]*\)username:.*/\1username: securityrat/g" config/application-prod.yml && \
	sed -i "s/^\([[:blank:]]*\)password:.*/\1password: mypassword/g" config/application-prod.yml && \
	sed -i "s/^\([[:blank:]]*\)url: jdbc:mysql:\/\/localhost:3306\/root/\1url: jdbc:mysql:\/\/mysql-server:3306\/securityrat/g" config/application-prod.yml && \
	rm ${COMPRESSEDFILE} && \
	rm -rf .cache/

USER securityrat

EXPOSE 9000

CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
	sleep ${JHIPSTER_SLEEP} && \
	java -Djava.security.egd=file:/dev/./urandom -jar $(ls | egrep .*\.jar$) --spring.profiles.active=prod
