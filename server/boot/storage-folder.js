'use strict';

var path = require("path");
var fs = require('fs');

var dir = path.join(__dirname, '../storage/temp');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}