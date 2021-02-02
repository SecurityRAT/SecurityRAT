# Build container for SecurityRAT 1.8

This Dockerfile is a build container for the SecurityRAT 1.8 release. It cointains maven and bower to compile the project.

## Build

Build the cointainer:

```
docker build -t maven-bower .
```


## Usage

Run the container and link the source path from SecurityRat into the container:

```
docker run -it --rm --name securityrat-maven -v <path_to_SecurityRAT>:/usr/src/mymaven -w /usr/src/mymaven maven-bower:latest mvn package -P prod
```

