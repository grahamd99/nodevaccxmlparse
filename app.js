var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js');
 
var parser = new xml2js.Parser();

fs.readFile('./vacc_example.xml', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  parser.parseString(data, function (err, result) {
    	console.dir(result);
    	console.log(util.inspect(result, false, null));
        console.log('Done');
  });
})
