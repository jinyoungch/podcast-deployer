#!/bin/bash
set -e

DIST_PATH="$PWD/dist/"

echo "delete $DIST_PATH folder..."
rm -rf $DIST_PATH

echo "compiling source code..."
npm ci
npm run compile

echo "install production dependencies..."
cp -f ./package*.json $DIST_PATH
cd $DIST_PATH
npm ci --production --silent