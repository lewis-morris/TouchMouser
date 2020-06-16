
name=$1
alt=$2
alt1=$3

pid=$(pidof "$name")
if [[ $alt == '*pyth*' ]]
then
	pid1=""	
else
	pid1=$(pidof "$alt")
fi

pid2=$(ps -f | grep $alt1 | awk '{print $2}')

echo $pid $pid1 $pid2