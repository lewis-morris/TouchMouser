#!/bin/bash


pid=""
pid1=""
pid2=""
pid3=""
pid4=""
pid5=""

### this is a mess if you have time then tidy it up

#get pid of name
pid=$(pidof "$2")
pid5=$(pidof "$4")

#get pid of path if not python
if [[ $4 == *'python'* ]] || [[ $4 == *"sh"* ]] || [[ $4 == "" ]]
then
  pid5=
fi

#get pid of path if not python 
if [[ $3 == *'python'* ]] || [[ $3 == *"sh"* ]]
then
  pid=
	pid1=
else
	pid1=$(pidof "$3")

fi

#echo $3
#if python get process of actual python proc and not all python running processes
if [[ $5 == *"/"* ]]

then

	pid2=$(ps -A -f | grep $5 | grep -v "grep" | grep -v "ps" | grep -v $0 | awk '{print $2}')
	new_4=$(basename $5)

	pid3=$(ps -A -f | grep $new_4 | grep -v "grep" | grep -v "ps" | grep -v $0 | awk '{print $2}')
  regex="[^/]*$"
	pid4=$(ps -A -f | grep $(echo $5 | grep -oP "$regex") | grep -v "grep" | grep -v "ps" | grep -v $0 | awk '{print $2}')

else
	pid2=""
fi

final_pids=$(echo ""$(echo $pid " " $pid1 " " $pid2 " " $pid3 " " $pid4 " " $pid5 " ")"" | awk '{for (i=1;i<=NF;i++) if (!a[$i]++) printf("%s%s",$i,FS)}{printf("\n")}')

window_names=$(bash $PWD"/TouchMouser/windows.sh" "$final_pids")

if [[ $1 == "check" ]]; then
	echo $final_pids, $window_names
elif [[ $1 == "kill" ]]; then
	kill $final_pids
	echo complete
else
	echo Error
fi