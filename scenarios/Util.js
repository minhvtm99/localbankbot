'use strict';
var request = require("request");

class Util {
	constructor() {
		console.log('Scenario ATM starting...');
	}

	 // get tagged message
    getMessageTags (msg_content) { 
      var options = {
        method: 'POST',
        url: 'https://bankbotapi.herokuapp.com/message_categorize',
        headers: {
          'postman-token': '94080799-6b58-9785-2c2d-5e50ed758bcd',
          'cache-control': 'no-cache',
          'content-type': 'application/json'
        },
        body: {
          message: msg_content
        },
        json: true
      };
		
      return this.getMyBody(options, function(err, body) {
        if (err) {
          return '';
        } else {
          let msg_tagged = body.categorized_msg;
          return msg_tagged;
         }
       });
 	}

    getMyBody (options, callback) {
	  request(options, function(error, response, body) {
	    if (error || response.statusCode !== 200) {
	      return callback(error || {
	        statusCode: response.statusCode
	      });
	    } 
	    callback(null, body);
	  });
	}

	extractProperty(msg_tagged, property) {
	  var result = '';
	  var i;
	  for (i = 0; i < msg_tagged.length; i++) {
	    if (msg_tagged[i][1] === property) {
	      result += msg_tagged[i][0] + ' ';
	    }
	  }
	  console.log("Desired property: " + result);
	  return result;
	} 
}

module.exports = Util;