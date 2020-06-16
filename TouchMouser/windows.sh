#!/bin/bash

final_pids="$1"


windows=

echo $pid
echo
echo

for pid in $final_pids
do 
    #echo line
    #echo $pid
    #if there is a window name then list it out
    window=$(echo $(wmctrl -lp | grep "$pid" | awk '{for(i=5; i<=NF; ++i) printf "%s ", $i; print $1"|"}'))
    if [[ $window ]]
    then    
        windows="$windows££$pid-+-$window"
    fi
    
done

echo $windows
