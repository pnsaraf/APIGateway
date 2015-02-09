/*Author: Prathamesh Saraf*/
/*Hanled all caching operations*/

var cacheModfs = require("fs")


exports.retrieveCachedValueIfAny = function(key,callback) {
		cacheModfs.readFile('./localCache.json',{encoding:"utf8"},function(error,data) {
			if (error) throw error;
			var preReadJsonObj = JSON.parse(data);
			if(preReadJsonObj[key]) {
				callback(preReadJsonObj[key]);
			} else 
				callback(null);
		});
}

exports.updateCache = function(data,value) {

	cacheModfs.readFile('./localCache.json',{encoding:"utf8"},function(error,readdata) {
		if (error) throw error;
		var preReadJsonObj = JSON.parse(readdata);
		var time = new Date().getTime();
		var ObjToAdd = {
			data:value,
			timestamp: time,
			cacheFor: data[1]
		}
		preReadJsonObj[data[0]] = ObjToAdd;
		cacheModfs.writeFile('./localCache.json',JSON.stringify(preReadJsonObj),function(error,data) {
			if(error) throw error;
		});
	});
	
}


exports.dumpCache = function() {
	cacheModfs.writeFile('./localCache.json',JSON.stringify({}),function(error,data) {
			if(error) throw error;
		});
}
