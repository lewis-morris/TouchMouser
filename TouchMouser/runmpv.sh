#!/bin/bash
kill $(pidof mpv)
mpv --fs --really-quiet --no-terminal "$*" &
echo "$!"