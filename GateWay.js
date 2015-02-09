/*Author : Prathamesh Saraf*/

var httpModule = require("http");
var apiModule = require("./apiBrain.js");
var cluster = require("cluster");
var gateWayServer;

var whiteListedIPs = [];
var blackListedIPs = [];
	
getTheBadIPs();

if(cluster.isMaster) {
	var objToSend = null;
	if(process.argv[3] == "config")
		objToSend = config();

	for(var i = 0; i < 2 ; i++) {
		var worker = cluster.fork();
		if(objToSend)
			worker.send(objToSend);
	}


	/*If a worker dies create a new one since we dont want only master to handle the request. 
	Passing the corresponding values to the new process from master as the new process would be unaware of these*/
	cluster.on("exit",function(worked,code,signal){
		var worker = cluster.fork();
		getTheBadIPs();
	});

} else {
	//This is the gateway server which will handle all incoming requests.
	gateWayServer = httpModule.createServer(function(request,response) {
		var clientReceivedData = "";
	
		//If ip is blacklisted, refuse the connection.

		if(checkIfBlacklisted(request.connection.remoteAddress)) {
			response.write("IP is blacklisted. Connection Refused");
			response.end();
			return;
		}

		request.on("data",function(data){
			clientReceivedData += data;
		});
		
		request.on("end",function() {
			var array = clientReceivedData.toString().split(":");
			apiModule.performAPICalls(array,function(receivedData,error){
				if(error) {
					response.write(error);
				}else{
					response.write(receivedData);
				}
				response.end();
			});
			
		});	

	/* Listen on the port provided on the commandline. 
	This same port should be used to connect to the server, 
	This information has to be communicated to the client.*/

	}).listen(process.argv[2]);


	process.on("message",function(msg) {
		if (msg.key == "whitelist") {
			whiteListedIPs = msg.value;
		} else if (msg.key == "blacklist") {
			blackListedIPs = msg.value;
		}
	});
}



function config()
{
		//Performs the server configuration. Any new configuration can just be added here
		if(typeof process.argv[4] == "undefined") {
			process.stdout.write("Restart the server and enter a valid configuration option\n");
			process.close();
		}
		else {
			switch(process.argv[4]) {
				case "whitelist":
					if(typeof process.argv[5] == "undefined") {
						process.stdout.write("Restart the server and enter a valid configuration option\n");	
						process.exit();
						break;
					} else {
						whiteListedIPs.push(process.argv[5]);
						var obj = {
							key: "whitelist",
							value: whiteListedIPs
						}
						process.stdout.write("IP " + process.argv[5] + " is now white listed\n\n");
						return obj;
					}	
				break;
				case "blacklist":
					if(typeof process.argv[5] == "undefined") {
						process.stdout.write("Restart the server and enter a valid configuration option\n");
						process.exit();	
						break;
					} else {
						blackListedIPs.push(process.argv[5]);
						updateTheBlaclistedIPs(process.argv[5]);
						var obj = {
							key: "blacklist",
							value: blackListedIPs
						}
						process.stdout.write("IP " + process.argv[5] + " is now black listed\n\n");
						return obj;
					}
				break;
				case "AnalyticsLog":
					apiModule.accessAnalytics();
				break;
				case "dumpCache":
					apiModule.dumpCache();
				break;
			}
		}	 
}

function getTheBadIPs()
{
	require("fs").readFile("./blacklistedIPs.txt",{encoding:"utf8"},function(error,data) {
		if(error) throw error;
		if(data != "undefined") {
			blackListedIPs = data.split("\n");
		}
	});
}
	
function updateTheBlaclistedIPs(ip)
{
	var append = ip + "\n"
	require("fs").appendFile("./blacklistedIPs.txt",append,function(err){if(err) throw err;});
}

function checkIfBlacklisted(ip)
{
	//Not to efficient sequential search.
	for(var i = 0;i < blackListedIPs.length; i++) {
		if(blackListedIPs[i] == ip)
			return true;
	}
}
