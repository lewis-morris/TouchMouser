#!/bin/bash

if [[ $3 == "pid" ]]
then
  if [[ $2 == "max" ]]
  then
    wmctrl -ia $(wmctrl -lp | awk -vpid=$1 '$3==pid {print $1; exit}') &> /dev/null
    wmctrl -ir $(wmctrl -lp | grep $1 | awk '{print $1}') -b add,maximized_vert,maximized_horz &> /dev/null
  else
    xdotool windowminimize $(wmctrl -lp | grep $1 | awk '{print $1}')
  fi
else
  if [[ $2 == "max" ]]
  then
    wmctrl -ia $1 &> /dev/null
    wmctrl -ir $1 -b add,maximized_vert,maximized_horz &> /dev/null
  else
    xdotool windowminimize $1 &> /dev/null
  fi
fi