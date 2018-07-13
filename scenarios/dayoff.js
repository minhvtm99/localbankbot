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
        if (items.length > 0 && items[items.length -1].missing.length > 0){
	        var missing = items[items.length -1].missing;
	        var fulfilled = items[items.length -1].fulfilled;
        	var date = '';
        	date = util.extractProperty(msg_tagged, 'date');
        	if (date !== '' && missing.includes('date')){
        		fulfilled['date'] = date;
        		var idx = missing.indexOf('date');
        		if (idx > -1){
        			missing.splice(idx, 1);
        		} 
        	}

	        var reason = '';	
	        console.log("PREV MESSAGE");
	        console.log(items[items.length -1]);

	        if (items.length > 1 && items[items.length -1].missing.includes('reason')){
	        	reason = message.text;
	        }

	        if (reason !== '' && fulfilled['reason'] == null){
	        	fulfilled['reason'] = reason;
				var idx = missing.indexOf('reason');
				if (idx > -1){
					missing.splice(idx, 1); 
				}       	
	        }

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

 	rejectReason(){
 		var text = "Anh/chị hãy gửi lý do từ chối yêu cầu xin nghỉ: Chọn 1 nếu nhân viên đã hết số ngày phép; Chọn 2 nếu trong thời gian nghỉ cơ quan có việc cần nhân viên có mặt; Chọn 3 nếu lý do nghỉ của nhân viên không được phê duyệt";
	    var buttons = [{
	        content_type: "text",
	        title: "1",
	        image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
	        payload: 'rejectReason, đã hết số ngày phép'
	      },
		  {
	        content_type: "text",
	        title: "2",
	        image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
	        payload: 'rejectReason, ngày mai cơ quan có việc cần bạn có mặt'
	      },
	      {
	        content_type: "text",
	        title: "3",
	        image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
	        payload: 'rejectReason, lý do nghỉ không được phê duyệt'
	      }];   
	                      
	    var rejectPackage = [text, reason];
	    return rejectPackage;
 	}
}


module.exports = Dayoff;