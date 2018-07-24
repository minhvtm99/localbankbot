'use strict';

//const Model = require('./model.js');
//const model = new Model();

const Util = require('./Util.js');
const util = new Util();
//var model;


class Transfer {
  constructor(model) {
  	//model = model;
    console.log('Scenario Dayoff starting...');
  }

	transferMoney(sender, message, msg_time, msg_tagged, items, model){
        if (items.length > 0 && items[items.length -1].missing.length > 0){
	        var missing = items[items.length -1].missing;
	        var fulfilled = items[items.length -1].fulfilled;
        	var acc = '';
        	acc = util.extractProperty(msg_tagged, 'acc_number');
        	if (acc !== '' && missing.includes('acc_number')){
        		fulfilled['acc_number'] = acc;
        		var idx = missing.indexOf('acc_number');
        		if (idx > -1){
        			missing.splice(idx, 1);
        		} 
        	}

        	var bank = '';
        	bank = util.extractProperty(msg_tagged, 'bank');
        	if (bank !== '' && missing.includes('bank')){
        		fulfilled['bank'] = bank;
        		var idx = missing.indexOf('bank');
        		if (idx > -1){
        			missing.splice(idx, 1);
        		} 
        	}

	        var amount = '';	
	        console.log("PREV MESSAGE");
	        console.log(items[items.length -1]);

	        if (items.length > 1 && items[items.length -1].missing.includes('amount')){
	        	amount = message.text;
	        }

	        if (amount !== '' && fulfilled['amount'] == null){
	        	fulfilled['amount'] = amount;
				var idx = missing.indexOf('amount');
				if (idx > -1){
					missing.splice(idx, 1); 
				}       	
	        }

		    model.logMessage({
		      'sender': sender,
		      'message': message.text,
		      'message tagged': msg_tagged,
		      'time': msg_time,
		      'request': 'transfer',
		      'missing':missing,
		      'fulfilled':fulfilled
		    });

	        var text;
	        if (missing.length == 0){
	          // f.txt(sender, "Yêu cầu chuyển tiền đang được xử lý");
	          //get info from fulfilled
	          text = '';
	          //delete request from log after processing 
	        }
	        else if (missing.includes('amount')){
	          console.log(missing);
	          text = "Bạn vui lòng gửi thêm thông tin về số tiền bạn muốn chuyển";
	      	}
	        else if (missing.includes('acc_number')) {
	          text = "Bạn vui lòng gửi thêm thông tin về số tài khoản nhận tiền";
	        }
	        else if (missing.includes('bank')){
	          console.log(missing);
	          text = "Bạn vui lòng gửi thêm thông tin về ngân hàng bạn muốn chuyển tiền tới";
	      	}
	      	else{
	      	  text = 'Số tiền: ' + fulfilled['amount'] +'\nSố tài khoản nhận tiền: ' + fulfilled['acc_number'] + '\nNgân hàng: ' + fulfilled['bank'];
	      	}

	      return text;

 	}
 }

}


module.exports = Transfer;