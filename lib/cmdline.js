/*jshint node:true */

var path = require('path'),
    fs = require('fs'),
    sys = require('util'),
    content = require('./static_content'),
    argv = require('optimist').alias('o', 'output').argv;

var inputFiles = null;
var outputFile = null;

// Determine list of input files file1.avsc file2.avsc
if (argv._) {
    inputFiles = argv._;
}

// Determine whether an output file is specified
if (argv.output) {
    outputFile = argv.output;
}

if (!inputFiles || inputFiles.length === 0) {
    sys.error('Usage: avrodoc [my-schema.avsc [another-schema.avsc...]] [-o=my-documentation.html] [> my-documentation.html] [-- my-schema.avsc [another-schema.avsc]]');
    process.exit(1);
}

function readJSON(filename) {
    var json, parsed;
    json = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf-8');
    try {
        parsed = JSON.parse(json);
    } catch (e) {
        sys.error('Not a valid json file: ' + filename);
        process.exit(1);
    }
    return parsed;
}

var schemata = inputFiles.map(function (filename) {
    return {json: readJSON(filename), filename: filename};
});

content.topLevelHTML({inline: true, schemata: schemata}, function (err, html) {
    if (err) {
        throw err;
    }
    if (outputFile) {
        fs.writeFile(outputFile, html, function (err) {
            if (err) {
                throw err;
            } else {
                console.log('Avrodoc saved to ' + outputFile);
            }
        });
    } else {
        sys.puts(html);
    }
});
