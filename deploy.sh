#!/bin/bash

SERVER=( 'davidr.me' )
DEPLOY_PATH=/server/asksomeone.it
USER=asksomeone-deploy

ENVIRONMENT=${1:-"production"}
REF=${2:-"master"}

trap 'test -n "$SUCCESS" || echo "  error: aborted"' EXIT
echo "* Deploying $ENVIRONMENT/$REF"

ssh $USER@$SERVER "cd $DEPLOY_PATH && \
                   git reset --hard && \
                   git checkout $REF && \
                   git pull && \
                   npm install && \
                   /etc/init.d/your_app restart"

SUCCESS=true
