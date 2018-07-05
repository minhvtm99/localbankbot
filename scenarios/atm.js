'use strict';

class Atm {
	constructor(f) {
		console.log('Scenario ATM starting...');
	}

	showLocation(sender, f) {
		let buttons = '';
		let text = '';
		let data = '';
		try {
			buttons = [{
				content_type: "location",
			}];
			text = 'Hãy gửi vị trí bạn muốn tìm các địa điểm giao dịch gần nhất của VietinBank';

			f.quick(sender, {
				text,
				buttons
			});
		} catch (e) {
			console.log(e);
		}
	}



  getAtmLocation(sender, lat, long, f) {
  	var key = 'AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
  	var location = lat + ',' + long;
  	var radius = 1000;
  	var sensor = false;
  	var types = "atm";
  	var keyword = "VietinBank";

  	var https = require('https');

    //var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + "key=" + key + "&query=ATM+VietinBank+" + locationText + "&types=" + types + "&language=vi";
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types + "&keyword=" + keyword;
    console.log(url);

    https.get(url, function(response) {
    	var body = '';
    	response.on('data', function(chunk) {
    		body += chunk;
    	});

    	response.on('end', function() {
    		var places = JSON.parse(body);

    		console.log(places);

    		var locations = places.results;

    		var displayIndex = 5;
    		if (displayIndex > locations.length) {
    			displayIndex = locations.length;
    		}

    		var arrayLocationDisplay = [];

    		for (var i = 0; i < displayIndex; i++) {
    			var displayLoc = locations[i];
          //console.log('getAtmLocation: ' + i + ' >>> ' + JSON.stringify(displayLoc));
          var targetLoc = displayLoc.geometry.location.lat + ',' + displayLoc.geometry.location.lng;
          var gmapUrl = "https://www.google.com/maps/dir/" + location + "/" + targetLoc;
          var imgUrl = "https://www.maketecheasier.com/assets/uploads/2017/07/google-maps-alternatives-featured.jpg";

          arrayLocationDisplay.push({
          	title: displayLoc.name,
          	image_url: imgUrl,
          	subtitle: displayLoc.vicinity,
          	default_action: {
          		type: "web_url",
          		url: gmapUrl,
              //messenger_extensions: true,
              //webview_height_ratio: "tall",
              //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
          },
          buttons: [{
          	type: "web_url",
          	url: gmapUrl,
          	title: "Chỉ dẫn"
          }]
      });

      }
      console.log(arrayLocationDisplay);

      if (arrayLocationDisplay.length > 0) {
      	var obj = {
      		recipient: {
      			id: sender
      		},
      		message: {
      			attachment: {
      				type: "template",
      				payload: {
      					template_type: "generic",
      					elements: arrayLocationDisplay
      				}
      			}
      		}
      	}

      	f.sendNews(obj)
      	.catch(error => console.log('getAtmLocation: ' + error));
      } else {
      	f.txt(sender, 'Không tìm thấy địa điểm nào phù hợp với yêu cầu của anh/chị');
      }

      return locations;
  });
    }).on('error', function(e) {
    	console.log("getAtmLocation Got error: " + e.message);
    	return;
    });
}

findGeoLoc(sender, street, f) {

	var unencoded = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + street_name + '&key=AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
	var url = encodeURI(unencoded);

	console.log("aaaaaa:" + url);
	var https = require('https');

	https.get(url, function(response) {
		var body = '';
		response.on('data', function(chunk) {
			body += chunk;
		});

		response.on('end', function() {
			var places = JSON.parse(body);

                //console.log(places);

                var locations = places.results;

                let text = "Bạn muốn tìm ATM ở địa chỉ cụ thể nào sau đây?";
                let buttons = [];
                for (var i = 0; i < locations.length; i++) {
                	var loc = locations[i];
                	console.log(loc);
                	var j = i + 1;

                	text += ' Chọn ' + j + ' để tìm ATM ở ' + loc.formatted_address;
                	console.log(text);

                	buttons.push({
                		content_type: 'text',
                		title: j,
                		image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
                		payload: 'geoCode : ' + loc.geometry.location.lat + ' ' + loc.geometry.location.lng
                	});
                }
                console.log(buttons);
                if (buttons.length > 0) {

                	try {
                		f.quick(sender, {
                			text,
                			buttons
                		});

                	} catch (e) {

                		console.log(JSON.stringify(e));
                	}

                } else {
                	f.txt(sender, 'Không tìm thấy địa điểm nào phù hợp với yêu cầu của anh/chị');
                	return;
                }

                return locations;
            });
	}).on('error', function(e) {
		console.log("getAtmLocation Got error: " + e.message);
		return;
	});

}
}

module.exports = Atm;