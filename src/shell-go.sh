#!/usr/bin/env bash
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${SCRIPTDIR}/target/env.sh"
cd "${SCRIPTDIR}/go"
bash --rcfile <(cat ~/.bashrc; echo 'PS1="${PS1}GO > "')