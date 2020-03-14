const fs = require('fs');

var username = read('./data.json').username;



function read(path) { return JSON.parse(fs.readFileSync(path)); }
function write(data, path) { fs.writeFileSync(path, null); fs.writeFileSync(path, JSON.stringify(data, null, 4)); }

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
var lastchoice = 
{
  "out": "",
  "bias": 1,
  "count": 1,
  "followup": -1
}

function answerPhrase(message)
{
  var net = read('./net.json');
  var phrases = read('./phrases.json');
  var doesInclude = false;
  var messageindex = 0;
  for (var i = 0; i < net.length; i++) {
    if(net[i].message == message)
    {
      messageindex = i;
      doesInclude = true;
      break;
    }
  }
  if(!doesInclude)
  {
    var newResponse = 
    {
      "message" : message,
      "outcomes" : generateOutcomes(phrases, messageindex)
    }
    net.unshift(newResponse);
  }  
  
  //MAIN LOOP
  var highestbias = -999;
  var biaschange = -1;
  var bestchoice;
  for (var i = 0; i < net.length; i++) {

    //net[i].outcomes = generateOutcomes(phrases, i)

    if(net[i].message == message)
    {
      for (var j = 0; j < net[i].outcomes.length; j++) {
        if (net[i].outcomes[j].comesfrom == lastchoice.followup) 
        {
          var choices = net[i].outcomes[j].answers;
          var index;
          for (var k = 0; k < choices.length; k++) {
            if(choices[k].bias > highestbias)
            {
              highestbias = choices[k].bias;
              bestchoice = choices[k];
              index = k;
            }
          }          
          bestchoice.count += 1;
          bestchoice.bias += biaschange / bestchoice.count;
          choices[index] = bestchoice;
          net[i].outcomes[j].answers = choices;
          lastchoice = bestchoice;
          write(phrases, './phrases.json');
          write(net, './net.json');
          return bestchoice;

        }
      }
    }
  }




}
function generateOutcomes(phrases, thisid)
{
  var outcomes = [];
  for (var i = -1; i < phrases.length; i++) {
    var answers = [];
    if(i == thisid) continue;
    for (var j = 0; j < phrases.length; j++) {
      if(j == thisid) continue;
      for (var k = -1; k < phrases.length; k++) {
        if(k == thisid || k == i) continue;
        answers.unshift(
        {
          "out" : phrases[j],
          "bias" : 1.0,
          "count" : 1,
          "followup" : k
        });
      }
    }
    outcomes.unshift(
      {
        "comesfrom" : i,
        "answers" : answers
      });
  }
  return outcomes;
}
function reset()
{
  var data = read('./data.json');
  data.username = "";
  username = "";
  write(data, './data.json');

  var answers = read('./answers.json');
  answers = [];
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
    console.log(answer);
    if(answer != null) output = convertPhrase(answer.out);    
    return output;
  }
}