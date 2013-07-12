#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = null;
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = null;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlIsValid = function(inurl) {
    var instr = inurl.toString();
    var urlTester = new RegExp('^(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*[^\.\,\)\(\s]$');
    if (!urlTester.test(instr)) {
	console.log("%s is not a valid URL. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, loadFile) {
    if (loadFile) {
	return cheerio.load(fs.readFileSync(htmlfile));
    }
    else {
	return cheerio.load(htmlfile);
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, loadFile) {
    $ = cheerioHtmlFile(htmlfile, loadFile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var gradeHtml = function(htmlfile, checksfile, loadFile) {
    var checkJson = checkHtmlFile(htmlfile, checksfile, loadFile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <page_url>', 'URL to HTML page', clone(assertUrlIsValid), URL_DEFAULT)
	.parse(process.argv);

    if (program.file) {
	gradeHtml(program.file, program.checks, true);
    } else if (program.url) {
	rest.get(program.url).on('complete', function(result) {
	    if (result instanceof Error) {
		console.log("Error occurred accessing %s - %s", program.url, result.toString());
		process.exit(1);
	    } else {
		gradeHtml(result.toString(), program.checks, false);
	    }
	});
    } else {
	console.log("Either a file or a URL need to be provided. Exiting.");
	process.exit(1);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
