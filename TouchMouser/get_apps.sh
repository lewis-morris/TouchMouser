#!/bin/bash

#start xvfb and hide error if already running 
Xvfb :100 &>/dev/null & 
export DISPLAY=:100

for filename in /usr/share/applications/*.desktop /var/lib/snapd/desktop/applications/*.desktop; do
#for filename in /home/lewis/*.desktop ; do
  PID=
  procname=
  alt_procname=
  alt2_procname=
  alt3_procname=
  categories=
  app_name=
  icon=

	#extract the categories from the file
	categories=$(grep '^Categories' "$filename" | head -1 | sed 's/^Categories=//' | sed 's/%.//' | sed 's/^"//g' | sed 's/" *$//g')
	#get name
	app_name=$(grep '^Name' "$filename" | head -1 | sed 's/^Name=//' | sed 's/%.//' | sed 's/^"//g' | sed 's/" *$//g')
	#get icon location
	icon=$(grep '^Icon' "$filename" | head -1 | sed 's/^Icon=//' | sed 's/%.//' | sed 's/^"//g' | sed 's/" *$//g')
	#get all icons if not already a file
	if [[ $icon == /* ]] 
	then
		icons=$icon
	else
		icons=$(find "/usr/share/icons/" -name "*$icon.*")
	fi
	#exec get command

    CMD=$(grep '^Exec' "$filename" | head -1 | sed 's/^Exec=//' | sed 's/%.//' | sed 's/^"//g' | sed 's/" *$//g')
    #echo $CMD

    ## if ibus just skip
    if [[ $CMD == *"ibus"* ]]
    then
    	continue    	
    else
    	:
    fi


  #check if running and get pid try lowercase just in case

	PID=$(pidof "$app_name")
	found="false"
	if [[ -z "$PID" ]] 
	then
		lowerapp=$(echo "$app_name" | tr '[:upper:]' '[:lower:]')
		PID=$(pidof "$lowerapp")
		if [[ -z "$PID" ]]
		then
			:
		else
			procname=$lowerapp
			alt_procname=$lowerapp
			found="true"
		fi
	else
		procname=$app_name
		alt_procname=$app_name
		found="true"
	fi

	#check if PID exists if not try running and get PID

	if [[ -z "$PID" ]]
	then 
		##if no PID then try running it
	    nohup $CMD &>/dev/null &
	    PID=$!
	    alt3_procname=$(ps --no-header -p $PID -o comm)
	    #get proc name
	    procname=$(ps --no-header $PID | awk '{print $5}')
	    #get alt proc name 
	    regex="[^/]*$"
	    alt_procname=$(echo $procname | grep -oP "$regex")
	    temp_proc_path=$(ps --no-header $PID | awk '{print $6}')
	    temp_proc_param=$(ps --no-header $PID | awk '{print $7}')
	    if [[ $temp_proc_param == *"-"* ]]
	    then
	      alt2_procname=$temp_proc_path" "$temp_proc_param
	    else
	      alt2_procname=$temp_proc_path
	    fi
	else
		:
	fi 


	#kill if you had to open the file
	if [ $found == "false" ]
	then
		kill -SIGTERM $PID &>/dev/null
	fi

    
	## had this to get the PGID's from the PIDS but It doesnt appear to leave enough time to
	## allow the child processes to start - seems to be ok for now so leaving it out
    #pids=$(ps -eo pgid,pid | awk -v pid="$PID" '$1==pid{print $2}')
    #echo PIDS = $pids

    ##loop spawned pids
    #if [[ -z $PIDS ]] 
    #then
    # 	:
    #else
    # 	for pid in "${pids[@]}"; do 
    #		echo $pid
    #		kill $pid
    #	done
    #fi 




  ########################

  ## This is not how I intended to do it BUT chrome is causing me all sorts of issues getting the process name
  ## So i'm hardcoding this in for now to save my self the ansolute headache of making it work properly.
  ## its bad.. So sort it out later.

  if [[ $procname == *"chrome"* ]]
  then
    procname="chrome"
  fi

  ########################




    #if procname empty then skip else send to output
	if [[ -z "$procname" ]]
	then
		:
	else
    	echo {\"pid\":\"$PID\", \"app_name\":\"$app_name\", \"procname\":\"$procname\", \"alt_procname\":\"$alt_procname\", \"alt2_procname\":\"$alt2_procname\", \"alt3_procname\":\"$alt3_procname\", \"filename\":\"$filename\", \"cmd\":\"$CMD\", \"categories\":\"$categories\", \"icons\":\"$icons\"}
	fi

    #echo KILLING 

done
