/*Author : Prathamesh Saraf*/

var http = require("http");

var options = {
	hostname: "127.0.0.1",
	port: 9005,
	method: "POST"
};

var request = http.request(options);

request.write(process.argv[2] + ":"+ process.argv[3]);
request.end();

request.on("response",function(response){
	response.on("data", function(data){
		console.log(data.toString());
	});
});

request.on("error",function(e){
	console.log(e.message);	
});


