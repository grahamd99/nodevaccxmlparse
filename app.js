var fs      = require('fs'),
    util    = require('util'),
    xml2js  = require('xml2js'),
    express = require("express");
 
var parser = new xml2js.Parser();
var app = express();
var port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/",function(req,res){
  res.render("home");
});

fs.readFile('./vacc_example.xml', (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  parser.parseString(data, function (err, result) {
    	//console.dir(result);
    	//console.log(util.inspect(result, false, null));

      global.type               = result.Bundle.type[0].$.value;
      global.identifierSystem   = result.Bundle.entry[1].resource[0].Immunization[0].identifier[0].system[0].$.value;
      global.identifierValue    = result.Bundle.entry[1].resource[0].Immunization[0].identifier[0].value[0].$.value;
      global.vaccineProcedureCode = result.Bundle.entry[1].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].code[0].$.value;
      global.vaccineProcedureDisplay = result.Bundle.entry[1].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].display[0].$.value;     
      global.notGiven           = result.Bundle.entry[1].resource[0].Immunization[0].notGiven[0].$.value;
      global.vaccineCodeSNOMED  = result.Bundle.entry[1].resource[0].Immunization[0].vaccineCode[0].coding[0].code[0].$.value;
      global.vaccineCodeDisplay = result.Bundle.entry[1].resource[0].Immunization[0].vaccineCode[0].coding[0].display[0].$.value;
      global.dateChar           = result.Bundle.entry[1].resource[0].Immunization[0].date[0].$.value;
      global.nhsnumber          = result.Bundle.entry[3].resource[0].Patient[0].identifier[0].value[0].$.value;
      //console.log( "type = " + type );
      //console.log( "identifier (system) = " + identifierSystem );
      //console.log( "identifier (value) = " + identifierValue );
      //console.log( "notGiven = " + notGiven );
      //console.log( "vaccineCode (value) = " + vaccineCodeSNOMED );
      //console.log( "vaccineCode (display) = " + vaccineCodeDisplay );
      //console.log( "dateChar = " + dateChar );
      //console.log('Done');
  });
})

app.listen(port, () => console.log("Server started and listening on port " + port ));