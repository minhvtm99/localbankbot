'use strict';

const Model = require('./model.js');
const model = new Model();

const Util = require('./Util.js');
const util = new Util();

function findMessage(query) {
  return MongoClient.connect("mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev").then(function(db) {
    //var collection = db.collection('customers');
    var dbo = db.db("bankbotdev");
    return dbo.collection("customers").find(query).toArray();

    //return collection.find({'request':'findATM'}).toArray();
  }).then(function(items) {
    return items;
  });
}

class Transfer{
	constructor() {
    	console.log('Scenario Transfer starting...');
  	}


  	transferMoney(sender, message, msg_time, msg_tagged, items){

        console.log("AAAAAAAAAAAAA");

        var dict = {'amount':'số tiền', 'acc_number':'số tài khoản', 'bank':'tên ngân hàng'};

        if (items.length > 0 && items[items.length -1].missing.length > 0){
            var conditions = ['amount', 'acc_number', 'bank'];
	        var missing = items[items.length -1].missing;
	        var fulfilled = items[items.length -1].fulfilled;
	          //find missing condition  
	        var i;
	        for (i = 0; i < conditions.length; i++){
	          	var cond = conditions[i];
	            console.log("condition: " + cond);
	            var prop = util.extractProperty(msg_tagged, cond);
	            console.log("property: " + prop);
	            if(prop !== ''){
	              fulfilled[cond] = prop;
	              var index = missing.indexOf(cond);
	              if (index > -1) {
	              missing.splice(index, 1);
	              }
	            }
	          }

            console.log("FULFILLED: ");
            console.log(fulfilled);

            model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'transfer',
              'missing':missing,
              'fulfilled':fulfilled
            });

            if (missing.length == 0){
              // f.txt(sender, "Yêu cầu chuyển tiền đang được xử lý");

              //get info from fulfilled
              var text_reply = "Yêu cầu chuyển tiền đang được xử lý";
              return text_reply;
              //delete request from log after processing 
            }
            else {
               console.log(missing);

              var text = "Bạn vui lòng gửi thêm thông tin về ";
              var missing_item;
              for (i = 0; i < missing.length; i++){
                var missing_item = missing[i];
                text += dict[missing_item] + ', ';
              }
              text += 'mà bạn muốn chuyển tiền';
              // f.txt(sender, text);
              return text;
            }
       }
                              
	}
}

module.exports = Transfer;