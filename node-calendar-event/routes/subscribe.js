var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
const fs = require('fs');
router.post('/', async function(req, res, next) {
	res.header("Content-Type", "text/plain");
	res.send(req.query.validationToken);
	var accessToken = fs.readFileSync('accesstokenFile.txt', 'utf8');
	//const accessToken = await authHelper.getAccessToken(req.cookies, res);
	let parms = { title: 'Calendar', active: { calendar: true } };
	/*const client = graph.Client.init({
	  authProvider: (done) => {
	    done(null, 'EwBoA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAXYWVGq4EzJhnu8jIrnEN7iW7nZsigRKNBHboRwNi4R1PXgzsX5BytTWi+jwe7cpYX2wfZvvPbLX1GQEThqLrf3QMSQ0HdY+G3GF2tjQ7xB3Ci3tNKnqCugHXkVp18aC5rZT1F9fWG9tBjqqHbR5YddHn/0RSG1cCzYaw+vMKXF5uTtNAAy7626Eb5NZbBkdDBOTdWrmwJtHhUxNd1Dv8qZ93STm/4RZd156VS9Hy2OK2sKF8jkfJAub73OD2wy94VqwyV69xjTbaXNk5WT+mmYMmFnoeLWmBpJxdKlGB6KwaSW6tl7b/07bCV9J033SMIJ7cIzFkPTra1GeABOpNREDZgAACPjiGpLEIiIvOAIjH34icGRTzlxt0hiFyNsoF/fSa/hLShvpr1qwcn3jgox8UBcshxGRBujhdCNpWHA3Jnd3xVXPQcMomyMzAY2N4UNxCJl3innqQDrzchiTZwHaXSLBsK68WyubDQ2R8aKxZjVGVHgjzV6GdyY0w+hYYkzwi0dBwdgzBkk7Dv8SnjKnaOz9AHI1drnOS8uxCZAMvgTiRfv+9hzQuv5JrSGXgr7n16+pOX1IqSxaKhLG08/iNPrToZjJ8q8/dfwGa+Lf1kCfH4FYCtS9XJwtVEzYu5bSqHLchqOPaJTvC4egAmJfkXPM/rRDRi0MvHVsCGrE/qPlzH6OXT22tuCw53HUFEQ1nBxyEVIXjjWYEFEpcKxIzfEw1Uhn720JfGEKzuwnYgPz2PWwEoLf+FC5y8vI9s/i0aH1RJZkcZdGUW073qtX1TKVxKs8xkD7jWR9BRPyxvhJ1dicFOX5DUmwwKfsosXkh8f0U8LYB63DrB3myn39P4hhfU4Kv71bEkX/V0kLB5XKk/t63kAGTnaOKjkKsi2Z1sTdQUscF0QtJR9YNMR6dP9SWtMLhCLyKwG0rMeTVt/Qz0nSBH5SRuSD8I0+o3MGnQnl2jOAq5QbnCZhuERRVSy8peqaZcd0RDNdmSaL74vHyE9f343GZ2uZP66/HSqc2+vE+p4ty16EPbJyrnkyQD2nab/GoZVuI+Nur2x7py0M0MQHd/iVwoA5/uq9ksMYzEmYNQRYoN7lqqZx8XZQXmBF6maAgAI=');
	}
	});*/
	const client = graph.Client.init({
		authProvider: (done) => {
			done(null,accessToken);
		}
	});

	try {
		let res = await client.api('/me/events/'+req.body.value[0].resourceData.id)
		.header('Prefer','outlook.timezone="Pacific Standard Time"')
		.select('subject')
		.get();
		/*backURL=req.header('Referer') || '/';
		res.redirect(backURL);*/
		let subject = res.subject;
		var newStr = req.body.value[0].resourceData.id.replace(/=/g, "");
    	var id = newStr.substring(120);
		var json = JSON.stringify({ type:'message', data: subject, id:id});
		for (var i=0; i < global.clients.length; i++) {
			global.clients[i].sendUTF(json);
		}	
	}

	catch (err) {
		parms.message = 'Error retrieving events';
		parms.error = { status: `${err.code}: ${err.message}` };
		parms.debug = JSON.stringify(err.body, null, 2);
		res.render('error', parms);
	}
  	//console.log(global.WS);
	
});

module.exports = router;