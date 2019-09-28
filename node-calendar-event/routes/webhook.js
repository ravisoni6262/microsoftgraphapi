var express = require('express');
var router = express.Router();

var authHelper = require('../helpers/auth');

var graph = require('@microsoft/microsoft-graph-client');

router.get('/', async function(req, res, next) {
	const accessToken = await authHelper.getAccessToken(req.cookies, res);
	let parms = { title: 'WebHook', active: { calendar: true } };
		const client = graph.Client.init({
			authProvider: (done) => {
			done(null, accessToken);
		}
	});

	var today = new Date();
	var dd = String(today.getDate()+2).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

	var todayD = yyyy + '-'+ mm + '-'+ dd;
		
		console.log(todayD);
	//let date = date('Y-m-d',strtotime()); 
	const subscription = {
	   "changeType": "created,updated",
	   "notificationUrl": "https://www.expresstechsoftwares.com/subscribe",
	   "resource": "me/events",
	   "expirationDateTime":todayD+"T18:23:45.9356913Z",
	   "clientState": "secretClientValue"
	};

	try {
		const result = await client.api('/subscriptions')
		.post(subscription);
		parms.webres = JSON.stringify(result);
		res.render('webhook', parms);
	}

	catch (err) {
		console.log(err);
		parms.message = 'Error retrieving events';
		parms.error = { status: `${err.code}: ${err.message}` };
		parms.debug = JSON.stringify(err.body, null, 2);
		res.render('error', parms);
	}


	
	  
});

module.exports = router;