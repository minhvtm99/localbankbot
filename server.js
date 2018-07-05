'use strict';
const config = require('./config');
const Restify = require('restify');

const server = Restify.createServer({
	name: 'VietinBankFAQChatBot'
});

server.use();

const PORT = process.env.PORT || 3000;
// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

// Scenarios
const Scenario = require('./scenarios');
const scen = new Scenario(f);

// Wit.ai
const Wit = require('node-wit').Wit;
const wit = new Wit({
accessToken: config.WIT_ACCESS_TOKEN
});

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
server.use((req, res, next) => f.verifySignature(req, res, next));

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Handle incoming
server.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		let {
			sender,
			postback,
			message,
      timeOfMessage
		} = msg;
		
		console.log('----> incomming msg : ' + JSON.stringify(msg));

    
		if (postback && postback.payload) {
			scen.processPostback(sender, postback, f);
		} else if (message && message.text && !message.quick_reply) {
			scen.processMessage(sender, message, timeOfMessage, f, wit);
		} else if (message && message.quick_reply) {
			scen.processQuickreply(sender, message, timeOfMessage, f);
		} else if (message && message.attachments) {
			scen.processAttachment(sender, message, f);
		} else {

		}
	});

	return next();
});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`VietinBanker running on port ${PORT}`));