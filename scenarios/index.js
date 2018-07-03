'use strict';


//Get entities
const firstEntity = (entities, name) => {
  return entities &&
    entities[name] &&
    Array.isArray(entities[name]) &&
    entities[name] &&
    entities[name][0];
}
//mongodb
function doConnect() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
}
doConnect()

function createCollection() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bankbotdev");
    dbo.createCollection("customers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });

}

createCollection()

function logMessage(message) {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bankbotdev");
    dbo.collection("customers").insertOne(message, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

}

var MongoClient = require('mongodb').MongoClient;

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



function sortMessage(property){
  var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("bankbotdev");
  var mysort = { property: 1 };
  dbo.collection("customers").find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log("SORTED !");
    db.close();
  });
});
}

function deleteMessage(message){
  var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");

  dbo.collection("customers").deleteOne(message, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
  });
});
}


// get property
function extractProperty(msg_tagged, property) {

  var street_name = '';
  var i;
  for (i = 0; i < msg_tagged.length; i++) {
    if (msg_tagged[i][1] === property) {
      street_name += msg_tagged[i][0] + ' ';
    }
  }
  console.log("Desired property: " + street_name);
  return street_name;
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

      //       var sender_info = f.getSenderName(sender);

      // 		console.log('getSenderName: ' + JSON.stringify(sender_info));
      //     console.log(sender_info);

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

          // CASE find ATM

          var street_name = extractProperty(msg_tagged, 'Name');
          var atm = extractProperty(msg_tagged, 'ATM');
          var atm_criteria = {'sender': sender}
          
          sortMessage('time');
          
          findMessage(atm_criteria).then(function(items) {

            if (items.length > 0 && items[items.length -1].request == 'findATM'){
                street_name = message.text;
                atm = 'ATM';
            }
            
            
            console.log("STREET : " + street_name);
            
            if (street_name !== '' && atm !== '') {
            //log message
              logMessage({
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

            logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'findATM'
            });
            f.txt(sender, "Bạn muốn tìm ATM ở khu vực nào?");
            return;

          }

                   
          }, function(err) {
            console.error('The promise was rejected', err, err.stack);
          });

//CASE transfer money
          var transfer = extractProperty(msg_tagged, 'transfer');
          if (transfer !== ''){
            logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'transfer',
              'missing':['amount', 'acc_number', 'bank'],
              'fulfilled': {'amount': null, 'acc_number': null, 'bank' : null}

            });

          }

          sortMessage('time');

          var transfer_criteria = {'sender':sender, 'request':'transfer'};

          findMessage(transfer_criteria).then(function(items) {

            var dict = {'amount':'số tiền', 'acc_number':'số tài khoản', 'bank':'tên ngân hàng'};

            if (items.length > 0 && items[items.length -1].missing.length > 0){
              var conditions = ['amount', 'acc_number', 'bank'];
              var missing = items[items.length -1].missing;
              var fulfilled = items[items.length -1].fulfilled;
              //find missing condition  
              var i;
              for (i = 0; i < conditions.length; i++ ){
                var cond = conditions[i];
                console.log("condition: " + cond);
                var prop = extractProperty(msg_tagged, cond);
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

            logMessage({
              'sender': sender,
              'message': message.text,
              'message tagged': msg_tagged,
              'time': msg_time,
              'request': 'transfer',
              'missing':missing,
              'fulfilled':fulfilled
            })

            if (missing.length == 0){
              f.txt(sender, "Yêu cầu chuyển tiền đang được xử lý");
              //get info from fulfilled

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
              f.txt(sender, text);
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


  processQuickreply(sender, message, timeOfMessage,f) {
    //console.log('processQuickreply WIT resp :');
    let buttons = '';
    let text = '';
    let data = '';
    
               logMessage({
              'sender': sender,
              'message': message.text,
              'time': timeOfMessage,
            });
    
    if (message && message.quick_reply) {
      let quickReply = message.quick_reply;

      if (quickReply.payload === 'QnA_YES') {
        f.txt(sender, "Bạn hãy gửi 3 để chọn sử dụng dịch vụ của VietinBank, 4 để nhận thông tin, 5 để tìm ATM gần nhất");
      }

      if (quickReply.payload === 'QnA_NO') {
        f.txt(sender, "Okay, have a good day");
      }
      if (quickReply.payload.includes('geoCode')) {
        var geoCode = quickReply.payload.split(' ');
        let lat = geoCode[2];
        let long = geoCode[3];
        console.log(lat + long);
        this.getAtmLocation(sender, lat, long, f);
        return;

      }
    }
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

        //         this.getAtmLocation(sender, lat, long, f);
        var st = "Nguyen Hue";
        //       this.findATMnear(sender,st,f );
        this.findGeoLoc(sender, st, f);
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
  findATMnear(sender, location, f) {
    var key = 'AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
    var types = 'atm';
    var https = require('https');
    var radius = 1000
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + "key=" + key + "&query=ATM+VietinBank+" + location + "&radius=" + radius + "&types=" + types + "&language=vi";
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
          var gmapUrl = "https://www.aworkoutroutine.com/push-pull-legs-split/";
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