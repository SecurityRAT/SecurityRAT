# What is this
**Security RAT** (Requirement Automation Tool) is a tool supposed to assist with the problem of addressing security requirements during application development. The typical use case is:
- specify parameters of the software artifact you're developing
- based on this information, list of common security requirements is generated
- go through the list of the requirements and choose how you want to handle the requirements
- persist the state in a JIRA ticket (the state gets attached as a YAML file)
- create JIRA tickets for particular requirements in a batch mode in developer queues
- import the main JIRA ticket into the tool anytime in order to see progress of the particular tickets

# Prerequisities:
- As this project is originally based on [JHipster](http://jhipster.github.io/), lot of prerequisities are common with this project. The following are necessary:
  - [JAVA 8 (JDK)](http://www.oracle.com/technetwork/java/javase/overview/java8-2100321.html)
  - [Maven](https://maven.apache.org/)
  - [Npm](https://www.npmjs.com)
  - [Bower](http://bower.io/)
  - [Grunt](http://gruntjs.com/)
  - [CAS](https://en.wikipedia.org/wiki/Central_Authentication_Service) server is needed for handling authentication. If you don't use one, you can e.g.:
    - use this simple demo as a starting point: https://github.com/leleuj/cas-overlay-demo
    - build your own CAS server according to instructions at http://jasig.github.io/cas
    - use one of the ready-made docker containers from https://hub.docker.com
  - [MySQL Database](https://www.mysql.com/)

# Before starting the application:
- checkout this project
- log into your mysql server and create an empty database for this application
- edit the database and CAS server configuration in the file `src/main/resources/config/application-dev.yml` according to the examples

  
# How to run in dev mode
- In the project directory, fire `npm install`.
- fire `mvn spring-boot:run`. This will automatically create the database structure if it doesnt exist yet.
- log in to your mysql server and in the `JHI_USER` table rename the 'admin' user login to your CAS username (in order to get full rights for your user). 
- Open a new terminal and move to the project directory.Then run `grunt serve`.
- go to http://localhost:9000. You should be verified by your previously setup CAS server and can start using the application.
- The constants (under Administration -> constants) must be edited accordingly.

# How to run in prod mode
- fire `mvn -Pprod -DskipTests package`. This will build the following files:
  - `target/securityRAT-${version}.war`
  - `target/securityRAT-${version}.war.original`
- copy the file `target/securityRAT-${version}.war` file to your production server
- in your target directory on the server, create a directory called `config` and copy the file `src/main/resources/config/application-prod.yml` there
- switch to the target directory and fire `java -jar securityRAT-${version}.war --spring.profiles.active=prod`
- log in to your mysql server and in the `JHI_USER` table rename the 'admin' user login to your CAS username (in order to get full rights for your user)
- it is recommended to use a web server (e.g. [Apache](https://httpd.apache.org/) as a proxy, with a proper TLS configuration set etc.
- go to the URL of your server. You should be verified by your previously setup CAS server and can start using the application.
- The constants (under Administration -> constants) must be edited accordingly.

# Next steps
- Fill securityRAT with requirements. You can import your own requirements or import the requirements.sql file to get started quickly
- In order to be able to export the requirements to JIRA, you need to set the following CORS headers at your JIRA instance:
```
Access-Control-Allow-Origin: https://$SecurityRAT_URL
Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST
Access-Control-Allow-Headers: Content-Type, X-Atlassian-Token
Access-Control-Allow-Credentials: true
```

# License
This project is distributed under the Apache license, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
