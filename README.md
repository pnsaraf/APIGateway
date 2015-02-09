
# APIGateway
Implemented an API management gateway which access various source API's on behalf of the client. This gateway primarily manages Twitter API’s. This gateway is implemented using node js.

This implementation includes the following functionality


1.	Accessing search, status update, rate limits, favorite list and retrieving status of a user using the Twitter API.
2.	Caching the results of various API’s.
3.	Displaying analytics log for the number of times an API has been accessed by the client.
4.	Blacklisting of IP’s.
5.	Configuration option for the server includes

	a.Display the analytic logs
	
	b.Dump cache
	
	c.Take the blacklisted IP as an input.		
6.	Load balancing using nodes cluster module.

How to run the application?


Operating system: Mac OS - Yosemite

1.	Launch terminal and start the server with the following command.
                node GateWay.js 9005. 
Where 9005 is the port number the server is listening on.

2.	Open another terminal window to work as a client. I have also included the client script, which would ping the server and receive the response. This response is displayed on the console.


3.	Testing search:
	
	a.	In the newly opened terminal windows type the following command.
        		  node httpclient.js search “Your search string”

	b.	This will hit the search API and return the search results to the client.


4.	Retrieving user status:

	a.	In the newly opened terminal window type in the following command
     		node httpclient.js getstatus "screen_name"
     		
	b.	This command expects the twitter screen name as the input. The results will be displayed on the console.


5.	Updating status:

	a.	In the newly opened terminal window type in the following command
		node httpclient.js statusupdate “The status to update”
	
	b.	This will update the status of the user.  A new tweet will be created.


6.	Retrieving rate limit status.
	
	a.	In the command line enter the following command.
			node httpclient.js callsremaining

	b.	This will return the number of calls made to search and status APIs
	
	c.	This uses Twitters own rate limit status APIs

7.	Retrieving favorites list:
	
	a.	In the command line enter the following command
			node httpclient.js favoriteslist "screen_name "
	
	b.	This command also takes in the twitter screen name as the parameter.
	
	c.	This will return the list of item marked as favorite by the user.

Server Configuration:


To enter any configuration for the server, start the server with “config” as the command line argument followed by the config option

1.	If the admin has to see the analytics log on the server, he needs to type in the following command
			node GateWay.js 9005 config AnaylticsLog
	This will list all the API’s accessed and the number of times they have been accessed. The logs are stored in analyticsLog.json

2.	If the admin want to dump all the currently cached values, he needs to enter the following command while starting the instance of the server.
			node GateWay.js 9005 config dumpCache 
	This will dump all the cached data. The cached file is localCache.json

3.	If an IP address is to be black listed, give the following option while starting the server instance.
			node GateWay.js 9005 config blacklist <ip>
	This will refuse any connection from the given IP address. The remove the blacklisted IP, delete it from the blacklistedIPs.txt file and restart the server.


NOTE: Whitelisted IPs code is yet to be implemented. If has dummy implementation right now in the code.
