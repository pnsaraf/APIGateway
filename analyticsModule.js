/*Author: Prathamesh Saraf*/
/*This module will log the number of times an API is accessed to a json file. This information can be retrieved using the logfile*/

var fs = require("fs");

exports.updateAnalyticLogFile = function(action) {
	fs.readFile('./analyticsLog.json',{encoding:"utf8"},function(error,data) {
		if(error) throw error;
		var jsonObj = JSON.parse(data);
		
		var found = 0;
		for(var i = 0; i < jsonObj[action.method].length; i++) {
			if(jsonObj[action.method][i].url == action.url) {
				found = 1;
				var count = jsonObj[action.method][i].count;
				count = count + 1;
				jsonObj[action.method][i].count = count;
				break;
			}
		}
		
		if(!found) {
			var str = String(action.url);
			var reqdURL = {
				url : String(action.url),
				count: 1
			}
			jsonObj[action.method].push(reqdURL);
		}

		var typeOfReqCount = jsonObj.MetaData[action.method];
		typeOfReqCount += 1;
		jsonObj.MetaData[action.method] = typeOfReqCount;
		fs.writeFile('./analyticsLog.json',JSON.stringify(jsonObj),function(err){
			if(err) throw err;
		})
	});
}

exports.checkForNumberOfhits = function(action,callback) {
	if(error) throw error;
		var jsonObj = JSON.parse(data);
		
		var found = false;
		for(var i = 0; i < jsonObj[action.method].length; i++) {
			if(jsonObj[action.method][i].url == action.url) {
				found = true;
				var count = jsonObj[action.method][i].count;
				if(count > 0);
				break;
			}
		}
}

exports.getAnayticsData = function() {
	fs.readFile('./analyticsLog.json',{encoding:"utf8"},function(error,data) {
		if(error) throw error;
		var jsonObj = JSON.parse(data);
		printTheRequiredLog("GET",jsonObj);
		printTheRequiredLog("POST",jsonObj);
	});
}

function printTheRequiredLog(method,json)
{
		for(var i = 0; i < json[method].length; i++) {
			process.stdout.write("URL: " + json[method][i].url + "	Number of times hit: " + json[method][i].count + "\n");
		}
}
