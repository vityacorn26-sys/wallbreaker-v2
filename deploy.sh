#!/bin/bash
set -e
npm run build
cp dist/index.html dist/favicon.svg dist/icons.svg . 2>/dev/null || true
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
rm -rf dist
git add -A
git commit -m "deploy"
git push origin gh-pages --force
git checkout main
