#!/usr/bin/env bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

die() {
    >&2 echo "ERROR: $1"
    exit 1
}

workDir="$1"
echo "workDir = $workDir"

[[ "$workDir" ]] || die "usage: package-site.sh <workDir>"

cd "${SCRIPTDIR}/go" || die 
source "${SCRIPTDIR}/target/env.sh" || die

mkdir "${workDir}/go/"
cp -a . "${workDir}/go/"


mkdir "${workDir}/result"


for site in "${workDir}/site/"*; do
    site="$(basename "$site")"
    rm -rf "${workDir}/content"
    mv "${workDir}/site/${site}" "${workDir}/content" || die "cannot mv"
    cd "${workDir}/go" || die "cannot cd"
    packr2
    go build -ldflags="-s -w -extldflags=-static" -o "../result/${site}"
done

