const fs = require('fs');

var username = read('./data.json').username;

function read(path) { return JSON.parse(fs.readFileSync(path)); }
function write(data, path) { fs.writeFileSync(path, null); fs.writeFileSync(path, JSON.stringify(data, null, 4)); }

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
var lastchoice;

function answerPhrase(message)
{
  var answers = read('./answers.json');
  var highestBias = -999;
  var bestChoice;
  var bestChoiceIndex;
  var biasWeight = -0.1;
  for(var m = 0; m < answers.length; m++)
  {
    var choices = answers[m].outputChoices;
    if(answers[m].message == message)
    {      
      for(var a = 0; a < choices.length; a++)
      {
        if(choices[a].bias > highestBias)
        {
          highestBias = choices[a].bias;
          bestChoice = choices[a];
          bestchoiceIndex = a;
        }
      }
      bestChoice.count += 1;
      bestChoice.bias += biasWeight / bestChoice.count;
      //console.log(answers[m].outputChoices[bestchoiceIndex]);
      answers[m].outputChoices[bestchoiceIndex] = answers[m].outputChoices[bestchoiceIndex];
      //console.log(answers);
      write(answers, './answers.json');
      lastchoice = bestChoice;
      return bestChoice.choice;
    }
  }
}
function addBiasForChoice(choice, bias)
{
  var answers = read('./answers.json');
  for(var m = 0; m < answers.length; m++)
  {
    for(var a = 0 ; a < answers[m].outputChoices.length; a++)
    {
      if(answers[m].outputChoices[a].message == choice.message)
      {
        answers[m].outputChoices[a].bias += bias / answers[m].outputChoices[a].count;
        write(answers, './answers.json');
        return;
      }
    }
  }
}
function resetBiases()
{
  var answers = read('./answers.json');
  for (var m = 0; m < answers.length; m++) 
  {    
    for (var a = 0; a < answers[m].outputChoices.length; a++) 
    {
      answers[m].outputChoices[a].count = 1;  
      answers[m].outputChoices[a].bias = 1; 
    }
  }
  write(answers, './answers.json');
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

    if(newmessage == "weirdo") { addBiasForChoice(lastchoice, -0.5); }
    if(newmessage == "yeye") { addBiasForChoice(lastchoice, 0.5); } 
    if(newmessage == "reset yourself") { resetBiases(); }
    var answer = answerPhrase(newmessage);


    output = convertPhrase(answer);
    return output;
  }
}