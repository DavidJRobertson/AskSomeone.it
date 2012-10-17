#!/bin/bash

SERVER=( 'asksomeone.it' )
DEPLOY_PATH=/server/asksomeone.it
USER=asksomeone-deploy

ENVIRONMENT=${1:-"production"}
REF=${2:-"master"}

trap 'test -n "$SUCCESS" || echo "  error: aborted"' EXIT
echo "* Deploying $ENVIRONMENT/$REF"



COMMAND="cd $DEPLOY_PATH && \
         git reset --hard --quiet && \
         git checkout --quiet $REF && \
         git pull && \
         npm install && \
         sudo /etc/init.d/asksomeone restart"



if [[ "$3" == "server-deploy" ]]
then
    eval $COMMAND
else
    ssh $USER@$SERVER "$COMMAND"
fi
SUCCESS=true
