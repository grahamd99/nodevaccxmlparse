var fs      = require('fs'),
    util    = require('util'),
    xml2js  = require('xml2js'),
    express = require("express"),
    bodyParser = require("body-parser");
 
var parser = new xml2js.Parser();
var app = express();
var port = 3000;
var NEMSfileToParse = "vacc_example_nems.xml";
//var NRLfileToParse = "vacc_example_nrl_device.xml";
var NRLfileToParse = "vacc_example_nrl_device3.xml";

global.fileToValidate = "test.xml";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/",function(req,res){
  res.render("home");
});


app.get("/multi",function(req,res){

  console.log("Attempting to parse: " + NRLfileToParse);

  fs.readFile('./' + NRLfileToParse, (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    parser.parseString(data, function (err, result) {
        //console.dir(result);
        //console.log(util.inspect(result, false, null));

        var numberOfResources = result.Bundle.entry.length - 1;
        console.log("NRL numberOfResources : " + numberOfResources);
        console.log("NRL type : " + typeof numberOfResources);

        global.identifierSystem = [];
        global.identifierValue = [];
        global.vaccineProcedureCode = [];
        global.vaccineProcedureDisplay = [];
        global.notGiven = [];
        global.vaccineCodeSNOMED = [];
        global.vaccineCodeDisplay = [];
        global.dateChar = [];
        global.vaccPracId = [];
        global.vaccCount = 0;

        for (i = 1; i <= numberOfResources; i++) {
          var tempResource = JSON.stringify( result.Bundle.entry[i].resource[0] );
          var endBit = tempResource.indexOf('":');
          var tempResource2 = tempResource.slice(2,endBit);
          console.log("Resource : " + i + " " + tempResource2);

          if (tempResource2 == "Device")  {
              // its the Device resource so maybe do nothing
              //console.log("Device meh");
          }

          if (tempResource2 == "Immunization")  {
            //global.vaccCount == global.vaccCount+1;
            global.vaccCount++;
            var vaccNumber = i-1;
            // Immunization resource
            global.identifierSystem[vaccNumber]  = result.Bundle.entry[i].resource[0].Immunization[0].identifier[0].system[0].$.value;
            global.identifierValue[vaccNumber]    = result.Bundle.entry[i].resource[0].Immunization[0].identifier[0].value[0].$.value;
            global.vaccineProcedureCode[vaccNumber] = result.Bundle.entry[i].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].code[0].$.value;
            global.vaccineProcedureDisplay[vaccNumber] = result.Bundle.entry[i].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].display[0].$.value;     
            global.notGiven[vaccNumber]           = result.Bundle.entry[i].resource[0].Immunization[0].notGiven[0].$.value;
            global.vaccineCodeSNOMED[vaccNumber]  = result.Bundle.entry[i].resource[0].Immunization[0].vaccineCode[0].coding[0].code[0].$.value;
            global.vaccineCodeDisplay[vaccNumber] = result.Bundle.entry[i].resource[0].Immunization[0].vaccineCode[0].coding[0].display[0].$.value;
            global.dateChar[vaccNumber]           = result.Bundle.entry[i].resource[0].Immunization[0].date[0].$.value;
            global.vaccPracId[vaccNumber]       = result.Bundle.entry[i].resource[0].Immunization[0].practitioner[0].actor[0].reference[0].$.value;
          }

          if (tempResource2 == "HealthcareService")  {
            // HealthcareService resource
            global.hcsSNOMED           = result.Bundle.entry[i].resource[0].HealthcareService[0].type[0].coding[0].code[0].$.value;
            global.hcsDisplay          = result.Bundle.entry[i].resource[0].HealthcareService[0].type[0].coding[0].display[0].$.value;
          }

          if (tempResource2 == "Patient")  {
            // Patient resource
            global.nhsnumber          = result.Bundle.entry[i].resource[0].Patient[0].identifier[0].value[0].$.value;
            global.patGiven           = result.Bundle.entry[i].resource[0].Patient[0].name[0].given[0].$.value;
            global.patFamily          = result.Bundle.entry[i].resource[0].Patient[0].name[0].family[0].$.value;
            global.patGender          = result.Bundle.entry[i].resource[0].Patient[0].gender[0].$.value;
            global.patDOB1            = result.Bundle.entry[i].resource[0].Patient[0].birthDate[0].$.value;
            global.patDOB2            = result.Bundle.entry[i].resource[0].Patient[0].birthDate[0].extension[0].valueDateTime[0].$.value;
          }

          if (tempResource2 == "Organization")  {
            // Organization resource
            global.orgODS             = result.Bundle.entry[i].resource[0].Organization[0].identifier[0].value[0].$.value;
            global.orgName            = result.Bundle.entry[i].resource[0].Organization[0].name[0].$.value;
          }

          if (tempResource2 == "Practitioner")  {
            // Practitioner resource
            global.pracId             = result.Bundle.entry[i].resource[0].Practitioner[0].id[0].$.value;
            global.pracPrefix         = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].prefix[0].$.value;
            global.pracGiven          = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].given[0].$.value;
            global.pracFamily         = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].family[0].$.value;
            global.pracSDS            = result.Bundle.entry[i].resource[0].Practitioner[0].identifier[0].value[0].$.value;
          }

        };

        console.log("vaccCount :" + global.vaccCount);
        res.render("nrl_multi.ejs");

    });

  });


    
});


app.get("/single",function(req,res){

  console.log("Attempting to parse: " + NEMSfileToParse);

  fs.readFile('./' + NEMSfileToParse, (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    parser.parseString(data, function (err, result) {
        //console.dir(result);
        //console.log(util.inspect(result, false, null));

        var numberOfResources = result.Bundle.entry.length - 1;
        console.log("NEMS numberOfResources : " + numberOfResources);
        console.log("NEMS type : " + typeof numberOfResources);

        // MessageHeader resource
        global.type = result.Bundle.type[0].$.value;

        for (i = 1; i <= numberOfResources; i++) {
          var tempResource = JSON.stringify( result.Bundle.entry[i].resource[0] );
          var endBit = tempResource.indexOf('":');
          var tempResource2 = tempResource.slice(2,endBit);
          console.log("Resource : " + i + " " + tempResource2);

          if (tempResource2 == "Immunization")  {
           // Immunization resource
            global.identifierSystem   = result.Bundle.entry[i].resource[0].Immunization[0].identifier[0].system[0].$.value;
            global.identifierValue    = result.Bundle.entry[i].resource[0].Immunization[0].identifier[0].value[0].$.value;
            global.vaccineProcedureCode = result.Bundle.entry[i].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].code[0].$.value;
            global.vaccineProcedureDisplay = result.Bundle.entry[i].resource[0].Immunization[0].extension[0].valueCodeableConcept[0].coding[0].display[0].$.value;     
            global.notGiven           = result.Bundle.entry[i].resource[0].Immunization[0].notGiven[0].$.value;
            global.vaccineCodeSNOMED  = result.Bundle.entry[i].resource[0].Immunization[0].vaccineCode[0].coding[0].code[0].$.value;
            global.vaccineCodeDisplay = result.Bundle.entry[i].resource[0].Immunization[0].vaccineCode[0].coding[0].display[0].$.value;
            global.dateChar           = result.Bundle.entry[i].resource[0].Immunization[0].date[0].$.value;
          }

          if (tempResource2 == "HealthcareService")  {
            // HealthcareService resource
            global.hcsSNOMED           = result.Bundle.entry[i].resource[0].HealthcareService[0].type[0].coding[0].code[0].$.value;
            global.hcsDisplay          = result.Bundle.entry[i].resource[0].HealthcareService[0].type[0].coding[0].display[0].$.value;
          }

          if (tempResource2 == "Patient")  {
            // Patient resource
            global.nhsnumber          = result.Bundle.entry[i].resource[0].Patient[0].identifier[0].value[0].$.value;
            global.patGiven           = result.Bundle.entry[i].resource[0].Patient[0].name[0].given[0].$.value;
            global.patFamily          = result.Bundle.entry[i].resource[0].Patient[0].name[0].family[0].$.value;
            global.patGender          = result.Bundle.entry[i].resource[0].Patient[0].gender[0].$.value;
            global.patDOB1            = result.Bundle.entry[i].resource[0].Patient[0].birthDate[0].$.value;
            global.patDOB2            = result.Bundle.entry[i].resource[0].Patient[0].birthDate[0].extension[0].valueDateTime[0].$.value;
          }

          if (tempResource2 == "Organization")  {
            // Organization resource
            global.orgODS             = result.Bundle.entry[i].resource[0].Organization[0].identifier[0].value[0].$.value;
            global.orgName            = result.Bundle.entry[i].resource[0].Organization[0].name[0].$.value;
          }

          if (tempResource2 == "Practitioner")  {
            // Practitioner resource
            global.pracPrefix         = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].prefix[0].$.value;
            global.pracGiven          = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].given[0].$.value;
            global.pracFamily         = result.Bundle.entry[i].resource[0].Practitioner[0].name[0].family[0].$.value;
            global.pracSDS            = result.Bundle.entry[i].resource[0].Practitioner[0].identifier[0].value[0].$.value;
          }

        }
    });

    res.render("nems_single.ejs");
    
  })
});

app.get("/validator",function(req,res){
  console.log("*****************GET*****************");
  console.log( "fileToValidate in GET: " + fileToValidate);
  console.log("*****************GET*****************");
  //res.render("validator.ejs", {fileToValidate: fileToValidate});
  res.render("validator.ejs", {fileToValidate: global.fileToValidate});
});

app.post("/startvalidator",function(req,res){
  console.log("*****************POST*****************");
  console.log("post to validator");
  console.log("req.body: " + req.body);  
  console.log("req.body.fileToValidate: " + req.body.fileToValidate);
  global.fileToValidate = req.body.fileToValidate;
  console.log( "post fileToValidate: " + fileToValidate );
  console.log("*****************POST*****************");
  res.redirect("/validator");
});

// Set placeholder values for optional FHIR resources
global.hcsSNOMED = "NA";
global.hcsDisplay = "NA";
global.pracPrefix  = "NA";
global.pracGiven   = "NA";
global.pracFamily  = "NA";
global.pracSDS    = "NA";




app.listen(port, () => console.log("Server started and listening on port " + port ));
