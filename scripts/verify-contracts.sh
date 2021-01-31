#!/bin/bash

DIR=$1
if [ $# -eq 0 ]; then 
chmod +x src/showConfig.js
DIR=$(src/showConfig.js out)
echo No arguments received, using default contracts directory
fi
[ -z $DIR ] && { echo "Usage: $0 <dir-name>"; exit 1; }
[ ! -d "$DIR" ] && { echo "The directory: ${DIR} doesn't exists"; exit 1; }
total=$(find $DIR -type f| wc -l)
fileIndex=0
declare -a my_array
echo Contracts dir: $DIR
for file in $(find $DIR -type f);
  do
    fileIndex=$(($fileIndex + 1))
    node src/verify.js $file $fileIndex $total
    result=$?
    if ((result > 0))
      then
        error=9
        msg+=($file)
      fi
  done
  failed=${#msg[@]}
  echo
  echo
  echo _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
  echo 
  echo   Contracts: $total
  echo   Verified: $((total - failed))
  echo   Failed: $failed
  echo
  echo -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
  echo
  echo Failed files:
  echo
  for line in "${msg[@]}"; do echo "$line"; done
  exit $error

