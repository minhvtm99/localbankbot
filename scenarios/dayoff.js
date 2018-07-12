'use strict';

//const Model = require('./model.js');
//const model = new Model();

const Util = require('./Util.js');
const util = new Util();
//var model;


class Dayoff {
  constructor(model) {
  	//model = model;
    console.log('Scenario Dayoff starting...');
  }

	requestReason(sender, message, msg_time, msg_tagged, items, model){

        var dict = {'reason':'lý do xin nghỉ', 'date':'thời gian xin nghỉ'};
        if (items.length > 1 && items[items.length -2].missing.includes('reason')){
        	var reason = message.text;
        }

        if (items.length > 0 && items[items.length -1].missing.length > 0){
        	var conditions = ['date'];
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

	        if (reason !== ''){
	        	fulfilled['reason'] = reason;
	        	let idx = missing.indexOf('reason');
	        	missing.splice(idx, 1);
	        }
	        
            console.log("FULFILLED: ");
            console.log(fulfilled);

            model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'request dayoff',
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
            else if (missing.includes('reason')){
              console.log(missing);
              text = "Bạn vui lòng gửi thêm thông tin về lý do xin nghỉ";
          	}
            else{
              text = "Bạn vui lòng gửi thêm thông tin về thời gian xin nghỉ";
            }
            		
	      return text;      
		}
 	}

 	dayoffType(){
 		let buttons = [{
          content_type: "text",
          title: "Nghỉ theo chế độ",
          image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
          payload: 'WithSalary'
        },
        {
          content_type: "text",
          title: "Nghỉ không lương",
          image_url: "https://png.icons8.com/color/50/000000/poor-quality.png",
          payload:"NoSalary"
        }];
        return buttons;
 	}
}


module.exports = Dayoff;