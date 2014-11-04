// usage:
// node get-weather.js [city] [reagion] [units]

var http  = require('http')
  , https = require('https')
  , query = require('querystring');


var options = {
  city  : process.argv[2],
  region: process.argv[3],
  units : process.argv[4].toLowerCase()
};

var request = getLocation(function (location) {
  if (location.city) {
    options.region = location.region_name;
    options.city   = location.city;
  }
  getWeather(options, function (data) {
    printResults(data);
  });
});

// use defaults
request.on('error', function () {
  getWeather(options, function (data) {
    printResults(data);
  });
});

function printResults (data) {
  data.location = options.city +', '+ options.region;
  console.log(JSON.stringify(data));
}

function getLocation(callback) {
  return getJSON("http://freegeoip.net/json/", callback);
}

function getWeather (options, callback) {
  var url = "https://query.yahooapis.com/v1/public/yql";

  var params = {
    q     : yqlQuery(options.city, options.region, options.units),
    env   : "store://datatables.org/alltableswithkeys",
    format: 'json'
  };

  var request = getJSON(url, params, function (data) {
    callback(data);
  });

  request.on('error', function (e) {
    callback({error: e.message});
  });
}

function getJSON(url, params, callback) {
  if (arguments.length == 2) {
    callback = params;
    params   = {};
  }

  var protocol    = /^https:/.test(url) ? https : http
    , querystring = query.stringify(params);

  if (querystring)
    url = url+'?'+querystring;

  var json = "", result;
  return protocol.get(url, function (res) {
    res.on('data', function(chunk) { json += chunk; });
    res.on('end',  function() {
      try {
        result = JSON.parse(json);
      } catch (e) {
        result = { error: e.message };
      }

      callback(result);
    });
  });
}

function yqlQuery(city, region, unit) {
  return "select * from weather.bylocation " +
    "where location='"+city+", "+region+"' and unit='"+unit+"'";
}
