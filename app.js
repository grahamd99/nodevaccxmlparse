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
var NRLVaccfileToParse = "vacc_example_nrl_device3.xml";
var NRLAllergyfileToParse = "allergy_example.xml";
var NRLObservationfileToParse = "obs_example_nrl.xml";

global.fileToValidate = "test.xml";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/",function(req,res){
  res.render("home");
});

app.get("/multiobs",function(req,res){

  console.log("Attempting to parse: " + NRLObservationfileToParse);

  fs.readFile('./' + NRLObservationfileToParse, (err, data) => {
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

        global.metaProfile = [];
        global.status = [];
        global.category = [];
        global.identifierSystem = [];
        global.identifierValue = [];
        global.obsCodeLOINS = [];
        global.obsCodeSNOMED = [];
        global.obsCodeDisplay = [];
        global.effectiveDate = [];
        global.performer = [];
        global.obsValue = [];
        global.obsUnitAbb = [];

        global.obsCount = 0;

        global.listCodeSNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].code[0].$.value;
        global.listDisplaySNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].display[0].$.value;

       for (i = 1; i <= numberOfResources; i++) {
          var tempResource = JSON.stringify( result.Bundle.entry[i].resource[0] );
          var endBit = tempResource.indexOf('":');
          var tempResource2 = tempResource.slice(2,endBit);
          console.log("Resource : " + i + " " + tempResource2);

          if (tempResource2 == "Device")  {
              // its the Device resource so maybe do nothing
              //console.log("Device meh");
          }


          if (tempResource2 == "Observation")  {
            global.obsCount++;
            var obsNumber = i-1;

            // Observation
            global.identifierSystem[obsNumber]   = result.Bundle.entry[i].resource[0].Observation[0].identifier[0].system[0].$.value;
            global.identifierValue[obsNumber]    = result.Bundle.entry[i].resource[0].Observation[0].identifier[0].value[0].$.value;
            global.metaProfile[obsNumber]  = result.Bundle.entry[i].resource[0].Observation[0].meta[0].profile[0].$.value;
            global.status[obsNumber]   = result.Bundle.entry[i].resource[0].Observation[0].status[0].$.value;
            global.category[obsNumber]   = result.Bundle.entry[i].resource[0].Observation[0].category[0].coding[0].code[0].$.value;
            global.obsCodeLOINS[obsNumber]  = result.Bundle.entry[i].resource[0].Observation[0].code[0].coding[0].code[0].$.value;
            global.obsCodeSNOMED[obsNumber]  = result.Bundle.entry[i].resource[0].Observation[0].code[0].coding[1].code[0].$.value;
            global.obsCodeDisplay[obsNumber] = result.Bundle.entry[i].resource[0].Observation[0].code[0].coding[1].display[0].$.value;
            global.effectiveDate[obsNumber] = result.Bundle.entry[i].resource[0].Observation[0].effectiveDateTime[0].$.value;
            global.performer[obsNumber] = result.Bundle.entry[i].resource[0].Observation[0].performer[0].reference[0].$.value;

            if ( global.metaProfile[obsNumber] == "https://fhir.hl7.org.uk/STU3/StructureDefinition/CareConnect-BloodPressure-Observation-1" ) {
              var sys = result.Bundle.entry[i].resource[0].Observation[0].component[0].valueQuantity[0].value[0].$.value;  
              var dia = result.Bundle.entry[i].resource[0].Observation[0].component[1].valueQuantity[0].value[0].$.value;  
              global.obsValue[obsNumber] = sys + "/" + dia;
              global.obsUnitAbb[obsNumber] = "mm[Hg]";
            } else{
            global.obsValue[obsNumber]  = result.Bundle.entry[i].resource[0].Observation[0].valueQuantity[0].value[0].$.value;    
            global.obsUnitAbb[obsNumber]  = result.Bundle.entry[i].resource[0].Observation[0].valueQuantity[0].code[0].$.value;          
            }

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
            global.orgId             = result.Bundle.entry[i].resource[0].Organization[0].id[0].$.value;
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

        console.log("obsCount :" + global.obsCount);
        res.render("nrl_multi_obs.ejs");

    });

  });


    
});


app.get("/multiallergy",function(req,res){

  console.log("Attempting to parse: " + NRLAllergyfileToParse);

  fs.readFile('./' + NRLAllergyfileToParse, (err, data) => {
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
        global.allergyCodeSNOMED = [];
        global.allergyCodeDisplay = [];
        global.listCodeSNOMED  = [];
        global.listDisplaySNOMED  = [];
        global.clinicalStatus = [];
        global.verificationStatus = [];
        global.type = [];
        global.asserter = [];
        global.note = [];
        global.reactionCodeSNOMED = [];
        global.reactionDisplaySNOMED = [];
        global.reactionSeverity = [];
        global.onsetString = [];
        global.assertedDate = [];

        global.allergyCount = 0;

        global.listCodeSNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].code[0].$.value;
        global.listDisplaySNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].display[0].$.value;

       for (i = 1; i <= numberOfResources; i++) {
          var tempResource = JSON.stringify( result.Bundle.entry[i].resource[0] );
          var endBit = tempResource.indexOf('":');
          var tempResource2 = tempResource.slice(2,endBit);
          console.log("Resource : " + i + " " + tempResource2);

          if (tempResource2 == "Device")  {
              // its the Device resource so maybe do nothing
              //console.log("Device meh");
          }


          if (tempResource2 == "AllergyIntolerance")  {
            //global.vaccCount == global.vaccCount+1;
            global.allergyCount++;
            var allergyNumber = i-1;

            // AllergyIntolerance
            global.identifierSystem[allergyNumber]   = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].identifier[0].system[0].$.value;
            global.identifierValue[allergyNumber]    = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].identifier[0].value[0].$.value;
            global.allergyCodeSNOMED[allergyNumber]  = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].code[0].coding[0].code[0].$.value;
            global.allergyCodeDisplay[allergyNumber] = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].code[0].coding[0].display[0].$.value;
            global.clinicalStatus[allergyNumber]     = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].clinicalStatus[0].$.value;
            global.verificationStatus[allergyNumber] = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].verificationStatus[0].$.value;
            global.type[allergyNumber]               = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].type[0].$.value;
            global.asserter[allergyNumber]           = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].asserter[0].reference[0].$.value;
            global.note[allergyNumber]               = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].note[0].text[0].$.value;
            global.reactionCodeSNOMED[allergyNumber]    = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].reaction[0].manifestation[0].coding[0].code[0].$.value;
            global.reactionDisplaySNOMED[allergyNumber] = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].reaction[0].manifestation[0].coding[0].display[0].$.value;
            global.reactionSeverity[allergyNumber]      = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].reaction[0].severity[0].$.value;
            global.onsetString[allergyNumber]           = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].onsetString[0].$.value;
            global.assertedDate[allergyNumber]           = result.Bundle.entry[i].resource[0].AllergyIntolerance[0].assertedDate[0].$.value;

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

        console.log("allergyCount :" + global.allergyCount);
        res.render("nrl_multi_allergy.ejs");

    });

  });


    
});


app.get("/multivacc",function(req,res){

  console.log("Attempting to parse: " + NRLVaccfileToParse);

  fs.readFile('./' + NRLVaccfileToParse, (err, data) => {
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

        global.listCodeSNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].code[0].$.value;
        global.listDisplaySNOMED  = result.Bundle.entry[0].resource[0].List[0].code[0].coding[0].display[0].$.value;

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
        res.render("nrl_multi_vacc.ejs");

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