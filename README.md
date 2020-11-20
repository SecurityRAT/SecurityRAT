# SecurityRAT

## Prologue

This is a fork of the original SecurityRAT repository that provides a couple of
modifications:

 * The underlying JHipster version and its dependencies have been updated to
   JHipster 6 (backend-only).
 * The original SecurityRAT Maven project was split up into three modules
   (backend, frontend, api) of a parent project.
 * An **Import Assistant** for a simpler import of requirements from Excel
   sheets and CSV files has been added.
 * The support of the MariaDB-DBMS has been added.

Since there were a lot of thoughts and ideas connected with these major
changes, I tried to explain them bellow:

1. First, I attempted to update the JHipster version as described
   [here](https://www.jhipster.tech/upgrading-an-application/). Unfortunately,
   this was not possible because the former JHipster version was too old and
   not supported by the update procedure.
2. Next, I tried to update JHipster by regenerating the project from its
   original configuration file (which the JHipster setup guide creates
   automatically).
   After some playing around I noticed that the number of changes that have
   been made to the initially generated project is too big to reimplement them
   in the period of time I had.
3. Thus, I decided to compare an untouched JHipster 6 project with the original
   SecurityRAT project and merged the existing classes from the old to the new
   project (where possible). This worked pretty well and was much faster than
   rewritting the whole application.

Unfortunately, this was not possible for the frontend part of the application
because JHipster moved from AngularJS (1.x) to Angular (2+) in the past. This
change makes it very hard to migrate the frontend. Since I had only little time
left, I stopped working on the frontend (which still works with the updated
backend).

I also played around with porting the frontend to webpack (replacing grunt and
bower), which would make porting to Angular 2+ much easier. But since there are
some parts of the JavaScript code that rely on hardcoded
bower_components-paths, this will need a lot of work.

Another major change was moving the application's API to another Maven project.
I decided to do this because I wanted to ensure that the endpoint names and the
data transfer objects stay the same as in the old version. Thus, the API lives
in its own domain that is independent of the backend's database entity domain
(although most API models have a 1:1 mapping to a database entity).

## Development and deployment

### Production (Executable JAR-archive with embedded web server)

Ensure that Maven is installed on your system and that it's available via the
PATH variable. Then execute the following command in your favorite shell:

```shell
mvn package -P prod
```

After the build process completed successfully, you can find the built artifact
at `securityrat-backend/target/securityrat-backend-1.7.10.jar`.

### Production (WAR-archive for Tomcat)

Ensure that Maven is installed on your system and that it's available via the
PATH variable. Open the `securityrat-backend/pom.xml` file in your favorite
text editor.

Replace the line `<packaging>jar</packaging>` with
`<packaging>war</packaging>`.

If you want that your war archive is still executable as standalone
application, skip the following step. Otherwise look for these lines:

```xml
<profile>
    <id>prod</id>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-undertow</artifactId>
        </dependency>
    </dependencies>
```

and replace them by this:

```xml
<profile>
    <id>prod</id>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-undertow</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>
```

Now, run the following command in your favorite shell (from the root directory
of the repository):

```shell
mvn package -P prod
```

After the build process completed successfully, you can find the built artifact
at `securityrat-backend/target/securityrat-backend-1.7.10.war`.

### Development

#### Backend

Please note that the Spring auto-restart at file modification feature has been
disabled for performance reasons. Also, the backend is required to listen on
port 8080 (configured by default), if you want to use the live-reload feature
of the frontend.

If you want to build the *securityrat-backend* project without building the
other Maven projects, you may run the following command once from the
repositories root directory (inside your favorite shell):

```shell
mvn install
```

Afterwards you should be able to build the securityrat-backend project without
problems due to missing dependencies. (Note that those builds will be based on
the installed versions of securityrat-api and securityrat-frontend. Ensure to
reinstall them after modification.)

#### Frontend

Always ensure that there is an up-to-date NodeJS installation inside your PATH
variable.

While the production build is integrated into the Maven build process, you may
start the live-reload development server by entering the following command into
your favorite shell (from the inside of the *securityrat-frontend* directory):

```shell
npx grunt serve
```

Please note that this also requires that there is a backend server running and
listening on port 8080 for requests.

## Compatibility

The database scripts have been adjusted and will migrate existing databases of
the old SecurityRAT versions. (Afterwards they may not be accessible for those
old SecurityRAT versions anymore.)

## Lost features / TODO

The following features have been removed due to incompatibility with the new
Spring version:

 * The CAS authentication was removed and needs to be reimplemented
 * Some administration features (health, configuration, etc.) are not available
   via the SPA because the DTO-structure and endpoint names have changed.
 * Elasticsearch configuration class has been removed temporary, otherwise
   production builds won't start successfully. Further investigation required.
 * ~~If you work with `npx grunt serve`, you may switch from the dynamically
   served web application to the static one that is included in the SecurityRAT
   backend (on a full page reload). Those missing paths require further
   configuration in the grunt config.~~ [DONE]
 * ~~Adding a ShowOrder type to the Import Assistant~~ [SUPERSEDED BY JAVASCRIPT] 
 * ~~Adding a regular expression type to the Import Assistant~~ [SUPERSEDED BY JAVASCRIPT]
 * ~~Choosing an existing entity as reference (Import Assistant)~~ [DONE]
 * n <-> m references between entities cannot be mapped at the moment (manual only)
