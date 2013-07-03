var http = require('http')
	, io = require('socket.io')
	, passport = require('passport')
	, express = require('express');

var app = express();

app.configure(function() {
	app.use(express['static'](__dirname + '/public'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});



app.get('/', function(req, res, next) {
	res.render('searchform', {error: req.cookies.searchformErrors});
});


app.get('/site', function(req, response, next) {
	if(!req.query.lookup) {
		response.cookie('searchformErrors', true);
		response.redirect('/');
		return;
	}
	response.cookie('searchformErrors', false);

	var options = {
		host: req.query.lookup,
		port: req.query.port,
		path: req.query.path,
		method: req.query.method
	};

	var req = http.request(options, function(res) {
		var d = '';
		res.on('data', function(chunk) { d += chunk; });
		
		res.on('end', function() {
			response.render('results'
				, {theSource: d
				, sentHeaders: JSON.stringify(options)
				, responseHeaders: JSON.stringify(res.headers)
				});
		});
	});

	req.on('error', function(e) { console.log("Got error: " + e.message); });

	req.end();
});





var httpPort = process.env.PORT || 5000
	, server = http.createServer(app).listen(5005);
