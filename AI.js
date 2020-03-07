const fs = require('fs');

var username = read('./data.json').username;



function read(path) { return JSON.parse(fs.readFileSync(path)); }
function write(data, path) { fs.writeFileSync(path, null); fs.writeFileSync(path, JSON.stringify(data, null, 4)); }

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
var lastchoice;
lastchoice = {"choice" : "", "bias" : 1.0, "count" : 1, "followup" : -1};

function answerPhrase(message)
{
  var answers = read('./answers.json');
  var outcomes;
  var bestchoice;
  var highestbias = -9999;
  var biasweight = -0.1;
  var choices;
  for(var m = 0; m < answers.length; m++)
  {
    if(answers[m].message == message)
    {
      console.log("Found same message");
      var outcomes = answers[m].outcomes;
      console.log("Outcomes " + outcomes.length);
      for(var o = 0; o < outcomes.length; o++)
      {
        console.log("Currentoutcome.comesfrom : " + outcomes[o].comesfrom + " | " + " Lastchoice.followup : " + lastchoice.followup)
        if(outcomes[o].comesfrom == lastchoice.followup)
        {
          //Is a follow up
          console.log("Is a follow up");
          choices = outcomes[o].choices;
          for (var c = 0; c < choices.length; c++) 
          {
            if(choices[c].bias > highestbias)
            {
              bestchoice = choices[c];
              highestbias = choices[c].bias;
              console.log(highestbias);
            }  
          }
          var index = choices.indexOf(bestchoice)
          bestchoice.count += 1;
          bestchoice.bias += biasweight / bestchoice.count;
          console.log("New updated choice :")
          console.log(bestchoice);
          choices[index] = bestchoice;
        }
      }
      outcomes.choices = choices;
      answers[m].outcomes = outcomes;
      lastchoice = bestchoice;
      write(answers, './answers.json')
      return bestchoice;
    }
  }
  
}
function reset()
{
  var data = read('./data.json');
  data.username = "";
  username = "";
  write(data, './data.json');

  var answers = read('./answers.json');
  var outcomes;
  var choices;
  for(var m = 0; m < answers.length; m++)
  {
    outcomes = answers[m].outcomes;    
    for(var o = 0; o < outcomes.length; o++)
    {
      choices = outcomes[o].choices;
      for(var c = 0; c < choices.length; c++)
      {
        choices[c].bias = 1.0;
        choices[c].count = 1;
      }
    }
    outcomes.choices = choices;
    answers[m].outcomes = outcomes;
  }
  write(answers, './answers.json')
}

function convertPhrase(message)
{
  if(message == "" || message == null) return "";
  var words = message.split(' ');
  var outphrase = "";
  for (var i = 0; i < words.length; i++) 
  {
    if(words[i] == "<username>") words[i] = username;
    outphrase = outphrase + " " + words[i];
  }
  return outphrase;
}




module.exports = 
{
  message : function message(newmessage)
  { 
    var output;
    //console.log(username);

    if(username == "")
    { 
      username = "waiting"; return "Who are you";
    }
    if(username == "waiting")
    {
      var olddata = read('./data.json');
      username = newmessage;
      olddata.username = newmessage;      
      write(olddata, './data.json');
    } 
    else newmessage = newmessage.toLowerCase();
    if(newmessage == "reset")
    { reset(); return "Finished reset" };



    var answer = answerPhrase(newmessage);
    if(answer != null) answer = answer.choice;
    output = convertPhrase(answer);
    return output;
  }
}