'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
var db;

//const Question = require('question');
//const question = new Question(db);

class Model {
 constructor() {
   console.log('Model starting...');
   // Initialize connection once
   MongoClient.connect(config.MONGO_URI, function(err, database) {
     if (err) {
       console.log('Unable to connect to the mongoDB server. Error:', err);
       throw err;
     } else {
       db = database;
       console.log('Connection established to', config.MONGO_URI);
     }
   });
 }
 
 deleteMessage(message) {
    console.log("DELETEEEEEE");
    var collection = db.db("bankbotdev").collection("customers");
    collection.deleteMany(message, function(err, result) {
      if (err) {
        console.log(err);
      } 

      else{
      console.log(result);
      // console.log("1 document deleted");
      }
    });
}



sortMessage(property){
  var mysort = { property: 1 };
  var collection = db.collection('customers');
  collection.find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
     console.log("SORTED !");
  });

}

logMessage(message) {
    var collection = db.db("bankbotdev").collection("customers");
    collection.insertOne(message, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
}

findUserKBConfig(sender) {
   return new Promise(function(resolve, reject) {
     var collection = db.collection('user_kb');
     var query = {
       uid: sender
     };
     
     collection.find(query).toArray(function(err, result) {
       if (err) {
         console.log(err);
         return reject(err);
       } else {

         //console.log('findUserKBConfig:' + JSON.stringify(result));
          resolve(result);
         
       }
     });
   });
 }
/*
 add(field, content, tag) {
   var collection = db.collection('questions');
   //Create some document
   var questionItem = {
     field: field,
     content: content,
     state: 'MA',
     tag: tag
   };

   // Insert some items
   collection.insert([questionItem], function(err, result) {
     if (err) {
       console.log(err);
     } else {
       console.log('Inserted %d documents into the "question" collection. The documents inserted with "_id" are:', result.length, result);
     }
   });

 }
 */
}

module.exports = Model;