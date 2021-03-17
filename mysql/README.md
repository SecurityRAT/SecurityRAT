This is a docker-compose repository for a quick&easy start if you want to play around with the SecurityRAT tool (otherwise available at https://github.com/SecurityRAT/SecurityRAT).

**Important: the setup is not suitable for a production environment!**

## Configuration

Configuration wise, nothing must be done since the application can be as well started with the default settings. The means that the following configurations are optional:

### Database settings

1. First change the appropriate value in the mysql-service:

    ```yaml
    environment:
        MYSQL_DATABASE: # database name
        MYSQL\_ROOT\_PASSWORD: # the root password.
        MYSQL\_USER: # This user has full priviledge over the MYSQL\_DATABASE
        MYSQL\_PASSWORD: #Password of the MYSQL\_USER
    ```

1. Change the values in the _securiryrat_ service to match does made above

    ```yaml
    environment:
        - SPRING\_DATASOURCE\_URL=jdbc:mysql://mysql-service:3306/${MYSQL\_DATABASE}?useUnicode=true&characterEncoding=utf8&useSSL=false
        - SPRING\_DATASOURCE\_USERNAME=${MYSQL\_USER} 
        - SPRING\_DATASOURCE\_PASSWORD=${MYSQL\_PASSWORD}
    ```

## How to run

1. Clone this project
1. Before running a new version of SecurityRAT, make sure you remove the old latest docker image. You can achieve this by running `docker rmi securityrat/securityrat:latest`. Alternatively, you could set the desired version of SecurityRAT you want to use by specifying the tag name in the _docker-compose.yml file_ as follows:

    ```yaml
    securityrat:
        container_name: securityrat 
        image: securityrat/securityrat:${image_tag_name}
    ```

1. Open a terminal and run `docker-compose build` from the project's root directory. This will build the latest mysql image which shall be used by the _mysql-service_.
1. Run `docker-compose up --remove-orphans` from the project's root directory.
1. After all services have started, navigate to http://localhost:9002 in your browser
1. Authenticate with one of the default users `admin/admin` or `user/user`
1. Update the database with the requirements set included as SQL dump ([OWASP ASVS 3.0.1 set](https://github.com/SecurityRAT/Security-Requirements/blob/master/owasp_asvs_3_0_1.sql)) in the _mysql-service_ image. Do this by running this command in a new terminal:

    ```sh
    docker exec securityrat-mysql sh -c '/bin/bash /var/dumpRequirements.sh'
    ```

## Cleaning up

After stopping the app, run `docker-compose down` from the project's root directory to remove the created containers.


