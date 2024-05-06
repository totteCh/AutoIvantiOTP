#!/bin/bash

set -e

# Make sure `node` is in $PATH.
export PATH="$PATH:"/usr/local/bin/:/opt/homebrew/bin/

cd "$(dirname "$0")/src"
ts-node index.ts "$1" "$2" "$3"
