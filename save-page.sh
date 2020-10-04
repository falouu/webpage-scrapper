#!/usr/bin/env bash

set -o errexit

SCRIPTDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [[ -f "${SCRIPTDIR}/config.sh" ]]; then
    source "${SCRIPTDIR}/config.sh"
fi

outputDir="$(pwd)"
workDir="$(mktemp -d)"
trap "rm -rf ${workDir}" EXIT

siteDir="${workDir}/site"
# pdfDir="${workDir}/pdf"
mkdir -p "${siteDir}"
pushd "${SCRIPTDIR}" >/dev/null
    make -s compile
    source "src/target/env.sh"
    ( cd "src" && npm start --silent -- --outputDir "${siteDir}" "$@" )
    #echo "NPM exit code: $?"
    if [[ $? != 0 ]]; then exit $?; fi

    ./src/package-site.sh "${workDir}"

    for result in "${workDir}/result/"*; do
        basres="$(basename "${result}")"

        # cp "${pdfDir}/${basres}.pdf" "${outputDir}/"
        # echo "PDF saved to: ${pdfDir}/${basres}.pdf"

        cp "${result}" "${outputDir}/"
        echo "Result saved to: ${outputDir}/${basres}"
        echo "Run it by simply: ./${basres}"
    done 

popd >/dev/null