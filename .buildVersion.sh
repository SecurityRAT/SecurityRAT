#!/bin/bash

set -e

RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
NORMAL=$(tput sgr0)

BRANCH=$(git branch | grep \* | awk '{print $2}')

printf '\n%-s\n' "${BLUE}Checking working branch and it's status $VERSION...${NORMAL}"
if [ $BRANCH != "master" ] || [ -z "$(git status | grep 'nothing to commit')" ]; then
	printf '\n%s\n\n' "${RED}Cannot push new version. Please make sure to be at the master branch and you have nothing to commit.${NORMAL}"
	exit 1
else 
	printf "[ ${GREEN}\xE2\x9C\x94${NORMAL} ] "
	printf '%s\n' "Current branch is master and it is up to date."
fi

if ! mvn -v; then 
	printf "[ ${RED}\xE2\x9D\x8C${NORMAL} ] "
	printf '%s\n\n' "Maven in not installed."
	exit 1
fi

VERSION=v$(printf 'VERSION\t${project.version}\n0\n' | mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate | grep VERSION | awk '{printf $2}')

printf '\n%-s\n' "${BLUE}Starting build for version $VERSION...${NORMAL}"
printf '\n%-s\n' "${YELLOW}Checking travis yaml...${NORMAL}"

if output=$(travis lint); then
	printf "[ ${GREEN}\xE2\x9C\x94${NORMAL} ] "
	printf '%s\n' "travis check done."
	printf '\n%s\n' "${YELLOW}Creating git tag ...${NORMAL}"

	if git tag -a $VERSION -m "latest version tag."; then
		printf "[ ${GREEN}\xE2\x9C\x94${NORMAL} ] "
		printf '%s\n' "git tag created."
		printf '\n%s\n' "${YELLOW}Pushing tag and latest commit to remote...${NORMAL}"

		if git push origin $VERSION && git push; then
			printf "[ ${GREEN}\xE2\x9C\x94${NORMAL} ] "
			printf '%s\n' "New version pushed. This will trigger travis build."
		fi
	else
		printf "[ ${RED}\xE2\x9D\x8C${NORMAL} ] "
		printf '%s\n\n' "Tag already exist. Make sure you update the pom.xml file."
		exit 1
	fi
	
	
else
	printf "[ ${RED}\xE2\x9D\x8C${NORMAL} ] "
	printf '%s\n\n' "Travis check failed outputing $output"
	exit 1
fi