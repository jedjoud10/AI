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
  var biasweight;
  var choices;
  for(var m = 0; m < ansers.length; m++)
  {
    if(answers[m].message == message)
    {
      var outcomes = answers[m].outcomes;
      for(var o = 0; o < outcomes.length; o++)
      {
        if(outcomes[o].comesfrom == lastchoice.followup)
        {
          for (var c = 0; c < choices.length; c++) 
          {
            if(choices[c].bias > highestbias)
            {
              bestchoice = choices[c];
              highestbias = choices[c].bias;
            }  
          }
          choice.count += 1;
          choice.bias += biasweight / choice.count;
          choices[c] = choice;
        }
      }
      outcomes.choices = choices;
      answers[m].outcomes = outcomes;
      return choice;
    }
  }
  
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

    var answer = answerPhrase(newmessage);


    output = convertPhrase(answer);
    return output;
  }
}