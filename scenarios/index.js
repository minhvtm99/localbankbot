'use strict';

const Model = require('./model.js');
var model = new Model();

// const Atm = require('./atm.js');
// const atm = new Atm();

const Util = require('./Util.js');
const util = new Util();

const Transfer = require('./transfer.js');
const transferCase = new Transfer(model);

const Dayoff = require('./dayoff.js');
const dayoffCase = new Dayoff(model);

//Get entities
const firstEntity = (entities, name) => {
  return entities &&
    entities[name] &&
    Array.isArray(entities[name]) &&
    entities[name] &&
    entities[name][0];
}


var request = require("request");
function getMyBody(options, callback) {
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      return callback(error || {
        statusCode: response.statusCode
      });
    }
    callback(null, body);
  });
}

//Scen class
class Scenario {
  constructor(f) {
    console.log('Scenario starting...');
  }

  processPostback(sender, postback, f) {
    return new Promise((resolve, reject) => {
      let buttons = '';
      let text = '';
      let data = '';

      //
      if (postback && postback.payload) {
        console.log('postback.payload :' + postback.payload);


      }
    });
  }


  processMessage(sender, message, timeOfMessage, f, wit) {
    return new Promise((resolve, reject) => {
      let buttons = '';
      let text = '';
      let data = '';
      console.log(message.text);
      console.log(JSON.stringify(message));   
      console.log("TIME: " + timeOfMessage);

      // get tagged message
      var request = require("request");
      let msg_content = message.text;
      let msg_time = timeOfMessage;     
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


      getMyBody(options, function(err, body) {
        if (err) {
          console.log(err);
        } else {
          let msg_tagged = body.categorized_msg;
          console.log(msg_tagged);

          // Extract property to find intent
          var street_name = util.extractProperty(msg_tagged, 'Name');
          var atm = util.extractProperty(msg_tagged, 'ATM');
          var transfer = util.extractProperty(msg_tagged, 'transfer');
          var dayoff = util.extractProperty(msg_tagged, 'dayoff');
          var req = util.extractProperty(msg_tagged, 'request');

          // Delete all other intents 
          if (atm !== ''){
            model.deleteMessage({"request":{ $ne: "" }});
          } 
          else if (transfer !== ''){
            model.deleteMessage({"request":{ $ne: "" }});
            model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'transfer',
              'missing':['amount', 'acc_number', 'bank'],
              'fulfilled': {'amount': null, 'acc_number': null, 'bank' : null}
            });
          }
          else if (dayoff !== '' && req !== ''){
            model.deleteMessage({"request":{ $ne: "" }});    
            model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'request dayoff',
              'missing':['date', 'reason'],
              'fulfilled': {'date': null, 'reason' : null}
            });       
          }
          else {

          }

          // CASE find ATM
          var atm_criteria = {'sender': sender};
          model.sortMessage('time');          
          model.findMessage(atm_criteria).then(function(items) {
            if (items.length > 0 && items[items.length -1].request == 'findATM'){
                street_name = message.text;
                atm = 'ATM';
            }
            
            
            console.log("STREET : " + street_name);
            
            if (street_name !== '' && atm !== '') {
              model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              });
              
            //f.txt(sender, "AAAAAAA" );
            console.log("call find Geocode " + street_name);
            //             this.findGeoLoc(sender, street_name, f);

            //big test
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

                  text += ' Chọn ' + i + ' để tìm ATM ở ' + loc.formatted_address;
                  console.log(text);

                  buttons.push({
                    content_type: 'text',
                    title: i,
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

            //end test
            console.log("end call find Geocode");
            return;

          } else if (atm !== '' && street_name == '') {

            model.logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'findATM'
            });
            f.txt(sender, "Bạn muốn tìm ATM ở khu vực nào?");
          }
                           
          }).catch(function(reason) {
           console.error(reason);
          });



          //CASE transfer money
          model.sortMessage('time');
          var transfer_criteria = {'sender':sender, 'request':'transfer'};
          model.findMessage(transfer_criteria).then(function(items) {
            if (items.length > 0){
              console.log("BBBBBBBBBB");
              console.log(msg_tagged);
              console.log(items);
              try {
                var reply = transferCase.transferMoney(sender, message, msg_time, msg_tagged, items, model);
                console.log(reply);
                f.txt(sender, reply);
              }
              catch(error){
                console.error(error);
              }
            }

          }, function(err) {
            console.error('The promise was rejected', err, err.stack);
          });

          //CASE take day off
          model.sortMessage('time');
          var dayoff_criteria = {'sender':sender, 'request':'request dayoff'};
          model.findMessage(dayoff_criteria).then(function(items) {
            if (items.length > 0){
              console.log("DAYOFF");
              console.log(msg_tagged);
              console.log(items);
              try {
                var reply = dayoffCase.requestReason(sender, message, msg_time, msg_tagged, items, model);
                console.log(reply);
                if (reply !== ''){
                  f.txt(sender, reply);
                } else {

                    var reason =  items[items.length -1].fulfilled['reason'];
                    var date =  items[items.length -1].fulfilled['date'];
                    let text = "Bạn muốn nghỉ theo hình thức nào?";
                    let buttons = [{
                        content_type: "text",
                        title: "Nghỉ theo chế độ",
                        image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
                        payload: 'WithSalary, ' + reason + ', ' + date + ', ' + sender
                      },
                      {
                        content_type: "text",
                        title: "Nghỉ không lương",
                        image_url: "https://png.icons8.com/color/50/000000/poor-quality.png",
                        payload: 'WithSalary, ' + reason + ', ' + date + ', ' + sender
                      }];   
                                      
                    f.quick(sender, {
                      text,
                      buttons
                    });
                  }

              }
              catch(error){
                console.error(error);
              }
            }

          }, function(err) {
            console.error('The promise was rejected', err, err.stack);
          });
        }
      });

    });


    //       wit.message(message.text)
    //         .then(({
    //           entities
    //         }) => {

    //           console.log('WIT resp:' + JSON.stringify(entities));
    //           let intent = firstEntity(entities, 'intent');

    //           switch (intent.value) {
    //             case 'greetings':
    //               f.txt(sender, 'Cảm ơn anh chị, chúc anh chị một ngày tốt lành :) ');
    //               break;

    //             case 'atm_location' || 'atm_place':
    //               this.showLocation(sender, f);
    //               break;

    //             default:
    //               break;
    //           }
    //         })
    //         .catch(error => {
    //           console.log(error);
    //           f.txt(sender, "Hệ thống phản hồi chậm, xin anh/chị chờ trong giây lát.");
    //         });
    //       return;

    //     });
  }


  processQuickreply(sender, message, timeOfMessage, f) {
    //console.log('processQuickreply WIT resp :');
    // let buttons = '';
    // let text = '';
    // let data = '';
    var managerID = '1972070776158761';
    model.logMessage({
      'sender': sender,
      'message': message.text,
      'time': timeOfMessage
    });
    
    if (message && message.quick_reply) {
      let quickReply = message.quick_reply;

      if (quickReply.payload === 'QnA_YES') {
        f.txt(sender, "Bạn hãy gửi 3 để chọn sử dụng dịch vụ của VietinBank, 4 để nhận thông tin, 5 để tìm ATM gần nhất");
      }

      else if (quickReply.payload === 'QnA_NO') {
        f.txt(sender, "Okay, have a good day");
      }

      else if (quickReply.payload.includes('geoCode')) {
        var geoCode = quickReply.payload.split(' ');
        let lat = geoCode[2];
        let long = geoCode[3];
        console.log(lat + long);
        this.getAtmLocation(sender, lat, long, f);
        //return;
      }

      else if (quickReply.payload.includes('WithSalary') || quickReply.payload.includes('NoSalary')) {
        var pack = quickReply.payload.split(', ');
        console.log(pack);
        let salary = pack[0];
        let reason = pack[1];
        let date = pack[2];
        let sender = pack[3];
        //let text_to_manager = '';
        let text_to_manager = "Nhân viên " + sender + ' ' + ' xin nghỉ phép thời gian: ' + date +  ' với lý do: ' + reason;
        console.log(text_to_manager);
        let buttons = [{
            content_type: "text",
            title: "Approve",
            image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
            payload: 'approve, ' + sender
          },
          {
            content_type: "text",
            title: "Reject",
            image_url: "https://png.icons8.com/color/50/000000/poor-quality.png",
            payload: 'reject, ' + sender
          }];   
        f.txt(sender, "Yêu cầu xin nghỉ đã được chuyển tới quản lý");
        f.fast(managerID, {
          text_to_manager,
          buttons
        });
      }           
      else if (quickReply.payload.includes('approve') || quickReply.payload.includes('reject')){
        var pack = quickReply.payload.split(', ');
        console.log("DECISION");
        console.log(pack);
        let decision = pack[0];
        let recipient = pack[1];
        var dict = {"approve":'được đồng ý', "reject":"bị từ chối"};
        let text = "Yêu cầu xin nghỉ của bạn " + dict[decision];
        f.txt(recipient, text);
      }
    }
    return;
  }

  processAttachment(sender, message, f) {
    //console.log('processAttachment ');
    let buttons = '';
    let text = '';
    let data = '';
    let locType = 'ATM';

    if (message && message.attachments) {
      let attach = message.attachments;

      if (attach[0].type === 'location') {
        //f.txt(sender, "https://www.google.com/maps");
        //f.txt(sender, 'Ban tu google map nhe :D');
        let coord = message.attachments[0].payload.coordinates;
        let lat = coord.lat;
        let long = coord.long;

        console.log("COORDS: " + lat + ", " + long);

        this.getAtmLocation(sender, lat, long, f);
        // var st = "Nguyen Hue";
        //       this.findATMnear(sender,st,f );
        // this.findGeoLoc(sender, st, f);
        return;
      }
      console.log("ATTACH" + JSON.stringify(attach[0]));


    }
  }

  menuYesNo(sender, textContent, f) {
    let text = textContent;
    let buttons = '';

    try {
      buttons = [{
          content_type: "text",
          title: "Có",
          image_url: "https://png.icons8.com/color/50/000000/thumb-up.png",
          payload: 'QnA_YES'
        },
        {
          content_type: "text",
          title: "Không",
          image_url: "https://png.icons8.com/color/50/000000/poor-quality.png",
          payload: 'QnA_NO'
        },
        {
          content_type: 'text',
          title: 'Maybe',
          image_url: 'https://icons8.com/icon/46457/question-mark-outline',
          payload: 'QnA_noanswer'
        }
      ];

      f.quick(sender, {
        text,
        buttons
      });
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  showRegister(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: 'Bạn muốn đăng ký dịch vụ nào của VietinBank?',
        buttons: [{
            type: 'web_url',
            title: 'FinBot',
            url: 'http://hungpt.handcraft.com/index.html?fbid=' + sender
          },
          {
            type: 'web_url',
            title: 'iPay',
            url: 'https://ebanking.vietinbank.vn/register/'
          },
          {
            type: 'web_url',
            title: 'eFAST',
            url: 'https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html'
          }
        ]
      }

      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }

  news(id, f) {

    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
                image_url: "http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
                subtitle: "Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              },
              {
                title: "VietinBank tuyển dụng gần 300 nhân sự cho chi nhánh",
                image_url: "https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
                subtitle: "Đáp ứng yêu cầu nhân sự cho chiến lược phát triển, Ngân hàng TMCP Công Thương Việt Nam (VietinBank) tuyển dụng gần 300 chỉ tiêu tại các vị trí nghiệp vụ và hỗ trợ tín dụng cho các chi nhánh trên toàn hệ thống...",
                default_action: {
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              },
              {
                title: "VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
                image_url: "http://image.bnews.vn/MediaUpload/Medium/2017/05/04/090646-bo-nhan-dien-thuong-hieu-vietinbank-2017-1.jpg",
                subtitle: "Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
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


  //ATM by street name

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

    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + street + '&key=AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
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

          text += ' Chọn ' + i + ' để tìm ATM ở ' + loc.formatted_address;
          console.log(text);

          buttons.push({
            content_type: 'text',
            title: i,
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
        }

        return locations;
      });
    }).on('error', function(e) {
      console.log("getAtmLocation Got error: " + e.message);
      return;
    });

  }
}

module.exports = Scenario;