/*Author : Prathamesh Saraf*/
/*This handles the API calls and call respective handlers for caching and analytics log*/

var OAuth = require('./oauth');
var httpsMod = require("https");
var cache = require( "./cacheModule.js" );
var analytics = require("./analyticsModule.js");
var lastTimeStamp = new Date().getTime();
var cacheTimeOutInterval = 15;//in Minutes

//Convinience array for adding any parameter to cache.
var cacheResults = ["favoriteslist","getstatus"];

/*
This is the API datastructure. 
This prvodes the ease of adding any new API and servicing it on clients behalf. 
Just add the URL with appropriate query string here and it should work.
*/

var URLDatastructure = {
	"search":{"method":"GET","url":"https://api.twitter.com/1.1/search/tweets.json?q"},
	"getstatus":{"method":"GET","url":"https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name"},
	"statusupdate":{"method":"POST","url":"https://api.twitter.com/1.1/statuses/update.json?status"},
	"callsremaining":{"method":"GET","url":"https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search,statuses"},
	"favoriteslist":{"method":"GET","url":"https://api.twitter.com/1.1/favorites/list.json?screen_name"}
}
		
exports.accessAnalytics = function(){
	analytics.getAnayticsData();
}

exports.dumpCache = function() {
	cache.dumpCache();
}

//This authenticates and performs any API calls.
exports.performAPICalls = function(data,callback) {
	var actionToPerform = "";
	if(data[0])
		actionToPerform = getBaseServiceAPI(data[0]);

	if(typeof actionToPerform == "undefined") {
		process.stdout.write("Given input is not correct. Please give a valid input option.\n\nExpected Input options\n 1)search\n2)getstatus\n3)statusupdate\n4)callsremaining\n5)favoriteslist\n Got "+data[0] + "\n");
		return;
	}
	authenticate();

	if(actionToPerform.method == "GET")
		performAGet(actionToPerform,data,callback);
	else if(actionToPerform.method == "POST")
		performAPost(actionToPerform,data,callback);

	
}

function authenticate()
{
	 oauth = new OAuth.OAuth(
      		'https://api.twitter.com/oauth/request_token',
      		'https://api.twitter.com/oauth/access_token',
      		'm4HZ6Lq7J9eOmVf6oZtvoB5ri',
      		'a6HersPcKJvdw1WkbJQhQwJ5YVeiF36Idl8vZwV0CTbgj1Grth',
      		'1.0A',
      		null,
      		'HMAC-SHA1'
    	);
}

function performAGet(action,data,callback)
{
	var url = action.url;
	if(data[1] != "undefined")
		url = url + "="+ encodeURI(data[1]); 
	else if(data[0] == "callsremaining") {
		url = url;
	}
	else {
		callback("Please enter a valid input for the service");
		return;
	}

	//This would be done asynchronously
	analytics.updateAnalyticLogFile(action);

	var doWeCache = checkIfNeedsToBeCached(data[0])
	if(doWeCache) {
		cache.retrieveCachedValueIfAny(data[0],function(cachedData) {
			if(cachedData) {
				var currentTime = new Date().getTime();

				if (Math.floor((currentTime - cachedData.timestamp) / 1000 / 60) <= cacheTimeOutInterval && cachedData.cacheFor == data[1]) {
					console.log("Data Retrieved from cache");
					callback(require('util').inspect(cachedData.data));
					return;
				} else {
					//Fire get request when we have any cached value and it has timed out.
					firetheGetRequest(url,callback,true,data);
				}
			} else {
				//Fire get request when we do not have any cached value and we need to cache.
				firetheGetRequest(url,callback,true,data);
			}
		});
	} else {
		//Fire the get request if we do not need to cache the current rquest value.
		firetheGetRequest(url,callback,false,data);
	}				
}


function firetheGetRequest (url,callback,doWeCache,data) 
{
	process.stdout.write("Fetching data. Please wait........\n\n");
		oauth.get(
			url,
			'3005506980-3U1dv6FOwS41S5cT1z076OwlX5gq5YBNG2vYggi',
			'fBs6ZICe5FgCZltoKi0l4V2HO9FM41fHbgyn387qdbVOv',
			function(e,returnedData,res) {
				if (e) {
					callback(e);
				} else {
					if(doWeCache) {
						cache.updateCache(data,require('util').inspect(returnedData));
					}
       					callback(require('util').inspect(returnedData));
				}				
			}
		)
}
function performAPost(action,data,callback)
{	
	var url = action.url;
	if(data[1] != "undefined")
		url = url + "="+ encodeURI(data[1]); 
	else if(data[0] == "callsremaining") {
		url = url
	}
	else {
		callback("Please enter a valid input for the service");
		return;
	}

	//This would be done asynchronously
	analytics.updateAnalyticLogFile(action);

	oauth.post(
      		url,
      		'3005506980-3U1dv6FOwS41S5cT1z076OwlX5gq5YBNG2vYggi',
      		'fBs6ZICe5FgCZltoKi0l4V2HO9FM41fHbgyn387qdbVOv',
		"",
		"",          
      		function (e, data, res){
        		if (e) {
				callback(e);
			} else
        			callback(require('util').inspect(data));
      		}
	);
}

function checkIfNeedsToBeCached(key)
{
	return (cacheResults.indexOf(key) != -1);
}

function getBaseServiceAPI(urlType)
{
	return URLDatastructure[urlType];
}
