#!/bin/bash
[ $# -eq 0 ] && { echo "Usage: $0 <dir-name>"; exit 1; }
DIR=$1
[ ! -d "$DIR" ] && { echo "The directory: ${DIR} doesn't exists"; exit 1; }
for file in $(find $DIR -type f);
  do
    echo $file
    node src/cleanPayload.js $file
    result=$?
    if ((result > 0))
      then
        error=9
      fi
  done
  exit $error

