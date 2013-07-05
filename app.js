var http = require('http')
	, io = require('socket.io')
	, passport = require('passport')
	, express = require('express')
	, jspretty = require('js-beautify')
	, htmlpretty = require('js-beautify').html;

var app = express();

app.configure(function() {
	app.use(express['static'](__dirname + '/public'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});

js_options = {
    "indent_size": 4,
    "indent_char": " ",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "jslint_happy": false,
    "brace_style": "collapse",
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0
};

app.get('/', function(req, res, next) {
	res.render('searchform', {error: req.cookies.searchformErrors});
});


app.get('/site', function(req, res, next) {
	if(!req.query.lookup) {
		res.cookie('searchformErrors', true);
		res.redirect('/');
		return;
	}
	res.cookie('searchformErrors', false);

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

	var startTime = Date.now();
	var request = http.request(options);
	request.end();

	request.on('socket', function(socket) {
		// console.log('got a socket after ' + (Date.now() - startTime));
	});

	request.on('response', function(response) {
		var d = '';
		var waterfallData = [];

		var responseTime = Date.now();

		response.on('data', function(chunk) {
			d += chunk;
		});

		response.on('end', function() {
			waterfallData.push({
				name: req.query.path
				, responseTime: responseTime - startTime
				, downloadTime: Date.now() - responseTime
			});

			res.render('results'
				, {theSource: htmlpretty(d)
				, sentHeaders: jspretty(JSON.stringify(options), js_options) // objectToHTML(options)
				, responseHeaders: jspretty(JSON.stringify(response.headers), js_options)
				, waterfallData: waterfallData
				});
		});
	});

	request.on('upgrade', function(res, socket, upgradeHead) {
		console.log('got upgraded!');
		socket.end();
		process.exit(0);
	});

	request.on('error', function(e) { console.log("Got error: " + e.message); });

	
});


var httpPort = process.env.PORT || 5005;
var server = http.createServer(app);
server.listen(httpPort);
