FROM openjdk:8-jre-alpine

ENV COMPRESSEDFILE="securityRAT*.tar.gz"

ENV JHIPSTER_SLEEP 0

RUN addgroup securityrat && \
	adduser -s /bin/sh -h /home/securityrat -G securityrat securityrat -D

USER securityrat

COPY securityRAT*.tar.gz /home/securityrat/

WORKDIR /home/securityrat

#Changes the keystore password and mysql root password accordingly in the security rat configuration file
RUN tar -xzf $COMPRESSEDFILE && \
	sed -i "s/^\([[:blank:]]*\)type:.*/\1type: FORM/g" config/application.yml && \
	rm ${COMPRESSEDFILE} && \
	rm -rf .cache/

EXPOSE 9000

CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
	sleep ${JHIPSTER_SLEEP} && \
	java -Djava.security.egd=file:/dev/./urandom -jar $(ls | egrep .*\.war$) --spring.profiles.active=prod