[![Build Status](https://github.com/SecurityRAT/SecurityRAT/actions/workflows/build.yml/badge.svg)](https://github.com/SecurityRAT/SecurityRAT/actions/workflows/build.yml)
[![License][license-image]][Apache License 2.0]
[![Join the chat at https://owasp.slack.com/archives/C76U4TNFJ](https://img.shields.io/badge/chat-on%20slack-blueviolet)](https://owasp.slack.com/archives/C76U4TNFJ)
[![OWASP Incubator](https://img.shields.io/badge/owasp-incubator%20project-orange.svg)](https://owasp.org/www-project-securityrat/)
[![Docker Pulls](https://img.shields.io/docker/pulls/securityrat/securityrat.svg)](https://hub.docker.com/r/securityrat/securityrat)

[**OWASP Security RAT**](https://owasp.org/www-project-securityrat/) (Requirement Automation Tool) is a tool helping you manage security requirements in your agile development projects. The typical use case is:

- specify parameters of the software artifact you're developing
- based on this information, list of common security requirements is generated
- go through the list of the requirements and choose how you want to handle the requirements
- persist the state in a JIRA ticket (the state gets attached as a YAML file)
- create JIRA tickets for particular requirements in a batch mode in developer queues
- import the main JIRA ticket into the tool anytime in order to see progress of the particular tickets

## Documentation

Please go to https://securityrat.github.io.

## Online Demo

Check out our brand-new online demo:

**url**: [SecurityRAT](https://securityrat.org)

**username**: demo

**password**: SecurityRATdemo10!

You can try it out with the demo version and can modify/add/delete requirements. The demo version will be resetted every 24 hours (CEST).

## Development

#### Backend
> Note that the Spring auto-restart feature has been disabled for performance reasons.
1. Configure the configuration files (`src/main/resources/application-dev.yml` and `src/main/resources/application.yml`) appropriately.  
2. Build all modules from the project's root folder with `mvn install`.
3. Start the application from the _securityrat-backend_ folder with `mvn spring-boot:run`.

#### Frontend

> Note that the backend is required to listen on port 9000 (configured by default), if you want to use the live-reload feature of the frontend.
> Also, always ensure that there is an up-to-date NodeJS installation inside your PATH variable.

Move to the _security-frontend_ module and start the frontend module with live reload with the command `npx grunt serve`.

## License

This project is distributed under the Apache license, Version 2.0: http://www.apache.org/licenses/LICENSE-2.

[license-image]: https://img.shields.io/badge/license-apache%20v2-brightgreen.svg
[Apache License 2.0]: https://github.com/SecurityRAT/SecurityRAT/blob/master/LICENSE
