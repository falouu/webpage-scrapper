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

    setsid go run main.go -open-browser=false &
    serverPID=$!
    trap "[[ -d '/proc/${serverPID}' ]] && kill -- -$serverPID" EXIT

    ( cd "${SCRIPTDIR}" && npm run fixPage --silent -- --dir "${workDir}/content") || die "failed to fix page"


    kill -- -$serverPID || die "cannot kill server"


    packr2



    go build -ldflags="-s -w -extldflags=-static" -o "../result/${site}"
done

