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
    	//console.dir(result);
    	//console.log(util.inspect(result, false, null));
      var type               = result.Bundle.type[0].$.value;
      var identifierSystem   = result.Bundle.entry[1].resource[0].Immunization[0].identifier[0].system[0].$.value;
      var identifierValue    = result.Bundle.entry[1].resource[0].Immunization[0].identifier[0].value[0].$.value;
      var vaccineCodeSNOMED  = result.Bundle.entry[1].resource[0].Immunization[0].vaccineCode[0].coding[0].code[0].$.value;
      var vaccineCodeDisplay = result.Bundle.entry[1].resource[0].Immunization[0].vaccineCode[0].coding[0].display[0].$.value;
      var notGiven           = result.Bundle.entry[1].resource[0].Immunization[0].notGiven[0].$.value;
      console.log( "type = " + type);
      console.log( "identifier (system) = " + identifierSystem);
      console.log( "identifier (value) = " + identifierValue);
      console.log( "vaccineCode (value) = " + vaccineCodeSNOMED);
      console.log( "vaccineCode (display) = " + vaccineCodeDisplay);
      console.log( "notGiven = " + notGiven);
      console.log('Done');
  });
})