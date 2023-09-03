#!/bin/bash
JWT_ISSUER=
JWT_SECRET=

rm -rf web-ext-artifacts
web-ext --source-dir app --artifacts-dir web-ext-artifacts sign --channel=listed --api-key=$JWT_ISSUER --api-secret=$JWT_SECRET
