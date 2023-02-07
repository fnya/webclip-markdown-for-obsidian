#!/bin/bash
rm -rf web-ext-artifacts
web-ext  --source-dir app --artifacts-dir web-ext-artifacts build
