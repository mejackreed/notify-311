var email = require("emailjs");
var request = require("request")
var _ = require('underscore')._;
var util = require('util')

var ACCOUNT_SID = 'AC3a7de91bbea3385db8836443880d9508';
var AUTH_TOKEN = '3e9760386050c1f203ff628d6eef4506';




var server = email.server.connect({
	user: "311sandiego@gmail.com",
	password: "ESRIUC2013",
	host: "smtp.gmail.com",
	ssl: true

});

exports.addPoint = function(req, res) {
	console.log(req.query)
	var message = "Hello this is the test message"
	var requestUrl = 'http://services.arcgis.com/nILn1H1Ns97PmrRf/ArcGIS/rest/services/Notifiers_WGS84/FeatureServer/0/query?where=&geometry=' + req.query.lng + '%2C' + req.query.lat + '&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=Email%2CPHONE&returnGeometry=false&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&f=json'

	request(requestUrl, function(error, body, response) {
		if (error) {
			console.log(error)
		}
		var data = JSON.parse(body.body)
		console.log(data)
		if (data.features) {
			_.each(data.features, function(val, i) {
				console.log(val.attributes.Email)
				var message = "A new issue, " + req.query.issue + ", has been reported in your area"
				// console.log(val.attributes.Email.indexOf('@sandiego.gov'))
				if (val.attributes.Email.indexOf('@sandiego.gov') != -1) {
					// return;
					console.log('not sending to a councilman')
				} else {
					server.send({
						text: message,
						from: "311 San Diego <311sandiego@gmail.com>",
						to: val.attributes.Email, //aisaak@evarigisconsulting.com",
						// cc:      "else <else@gmail.com>",
						subject: "A new issue has been reported in San Diego"
					}, function(err, message) {
						console.log('sent e-mail to ' + val.attributes.Email)
						// console.log(err || message);
					});

					if (val.attributes.PHONE) {
						console.log(val.attributes.PHONE)
						sendSMSMessage(message, val.attributes.PHONE)

					}
				}
			})
		}
	})
	res.send('yes')
};

function sendSMSMessage(message, recipient) {
	var twilio_to_number = "+1" + recipient
	//return process.nextTick(function() {

	var twilio_from_number = '+14045674691'
	var https, options, post_data, request;
	https = require('https');
	post_data = "From=" + twilio_from_number + "&To=" + twilio_to_number + "&Body=" + message;
	options = {
		host: 'api.twilio.com',
		path: "/2010-04-01/Accounts/" + ACCOUNT_SID + "/SMS/Messages.json",
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length,
			'Authorization': 'Basic ' + new Buffer(ACCOUNT_SID + ':' + AUTH_TOKEN).toString('base64')
		}
	};
	request = https.request(options, function(response) {
		var str;
		str = '';
		response.on('data', function(chunk) {
			return str += chunk;
		});
		return response.on('end', function() {
			return console.log(util.inspect(str));
		});
	});
	request.write(post_data);
	return request.end;
	//});
};

exports.addNotify = function(req, res) {
	console.log(req.query)
	var requestUrl = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/buffer?geometries='
	requestUrl += req.query.lng + ',' + req.query.lat + '&inSR=4326&outSR=4326&bufferSR=102113&distances=' + req.query.radius + '&unit=9035&unionResults=false&f=pjson'


	request(requestUrl, function(error, body, response) {
		var data = JSON.parse(body.body)

		res.send(data.geometries[0])
	})
}