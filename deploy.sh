#!/bin/bash

SERVER=( 'asksomeone.it' )
DEPLOY_PATH=/server/asksomeone.it
USER=asksomeone-deploy

ENVIRONMENT=${1:-"production"}
REF=${2:-"master"}

trap 'test -n "$SUCCESS" || echo "  error: aborted"' EXIT
echo "* Deploying $ENVIRONMENT/$REF"

ssh $USER@$SERVER "cd $DEPLOY_PATH && \
                   git reset --hard --quiet && \
                   git checkout --quiet $REF && \
                   git pull && \
                   npm install && \
                   sudo /etc/init.d/asksomeone restart"

SUCCESS=true
