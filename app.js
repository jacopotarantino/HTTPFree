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

function objectToHTML(obj) {
	var obj = JSON.stringify(obj);

	obj = obj.replace(/","/g, "\",<br>\"").replace(/\}\}/g, "}<br>}").replace(/\{"/g, "{<br>\"");
	obj = obj.replace(/headers":\{(<br>.*)\}/, function(match, p1, offset, string) {
		var inside = p1;
		inside = inside.replace(/<br>"/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;\"");
		return 'headers":{' + inside + '}';
	});

	/* finding items within an object:
	find opening brace where there are no opening braces inbetween it and closing brace
	replace both with html entities
	objects all work in a tree structure and can't overlap so rinse and repeat
	* needs to be done recursively

	repeat for arrays

	*/
	return obj;
}

function prettyHTML(str) {
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;<br>");
}


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

	var newHeaders = req.headers;
	newHeaders.host = req.query.lookup;
	newHeaders.cookie = '';
	newHeaders['accept-encoding'] = '';


	var options = {
		host: req.query.lookup
		, port: req.query.port
		, path: req.query.path
		, method: req.query.method
		, headers: newHeaders
	};

	var req = http.request(options, function(res) {
		var d = '';
		res.on('data', function(chunk) { d += chunk; });
		
		res.on('end', function() {
			response.render('results'
				, {theSource: prettyHTML(d)
				, sentHeaders: objectToHTML(options)
				, responseHeaders: objectToHTML(res.headers)
				});
		});
	});

	req.on('error', function(e) { console.log("Got error: " + e.message); });

	req.end();
});


var httpPort = process.env.PORT || 5005;
var server = http.createServer(app);
server.listen(httpPort);
