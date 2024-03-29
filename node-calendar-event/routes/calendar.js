var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Calendar', active: { calendar: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    // Set start of the calendar view to today at midnight
    const start = new Date(new Date().setHours(0,0,0));
    // Set end of the calendar view to 7 days from start
    const end = new Date(new Date(start).setDate(start.getDate() + 7));

    try {
      // Get the first 10 events for the coming week
      const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .top(10)
      .select('subject,start,end,attendees')
      .orderby('start/dateTime DESC')
      .get();

      parms.events = result.value;

      res.render('calendar', parms);
    } catch (err) {
      parms.message = 'Error retrieving events';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.render('error', parms);
    }

  } else {
    // Redirect to home
    res.redirect('/');
  }
});

router.post('/update', async function(reqe, resp, next) {
  const accessToken = await authHelper.getAccessToken(reqe.cookies, resp);
  console.log(accessToken);
  let parms = { title: 'Calendar', active: { calendar: true } };
  const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
  });
  try {
    const result = await client.api('/me/events/'+reqe.body.event_id)
    .update({subject: reqe.body.event_subject});
    backURL=reqe.header('Referer') || '/calendar';
    resp.redirect(backURL);
  }
  catch (err) {
    console.log(err);
      parms.message = 'Error retrieving events';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      resp.render('error', parms);
    }
});

module.exports = router;
