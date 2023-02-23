
module.exports = getDate;  //no paranthesis as we don't want to activate func right now 

function getDate(){
  var today = new Date();

  var options = {
  weekday : "long",
  month: "long",
  day : "numeric"
  };
  var day = today.toLocaleDateString("en-US", options);
  return day;
}
