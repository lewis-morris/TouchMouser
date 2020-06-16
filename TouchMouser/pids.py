
name=$2
alt=$3
alt1=$4

#get pid of name
pid=$(pidof "$name")

#get pid of path if not python 
if [[ $alt == *'pyth'* ]]
then
	pid1=""	
else
	pid1=$(pidof "$alt")
fi

#if python get process of actual python proc and not all python running processes 
if [[ $alt1 == *"/"* ]]
then
	pid2=$(ps -f | grep $alt1 | awk '{print $2}')
else
	pid2=""
fi


if [[ $1 == "check" ]]
then
	echo $pid $pid1 $pid2
else if [[ $1 == "kill" ]]
then
	kill $pid $pid1 $pid2
	echo complete
else
	echo Error