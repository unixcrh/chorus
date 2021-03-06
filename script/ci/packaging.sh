#!/bin/bash

export RAILS_ENV=packaging
GPDB_HOST=chorus-gpdb-ci
ORACLE_HOST=chorus-oracle
HAWQ_HOST=chorus-gphd20-2

. script/ci/setup.sh

rm -fr .bundle
GPDB_HOST=$GPDB_HOST HAWQ_HOST=$HAWQ_HOST ORACLE_HOST=$ORACLE_HOST bundle exec rake package:installer --trace
