#!/usr/bin/env bash

set -o errexit

SCRIPTDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [[ -f "${SCRIPTDIR}/config.sh" ]]; then
    source "${SCRIPTDIR}/config.sh"
fi

outputDir="$(pwd)"
pushd "${SCRIPTDIR}" >/dev/null
    make -s compile
    source "src/target/env.sh"
    cd "src" && npm start --silent -- --outputDir "${outputDir}" "$@"
popd >/dev/null