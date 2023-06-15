module.exports.getDate=function()
{
  let today=new Date();
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' ,hour:"numeric",minute:"numeric"};//for using time data ij js
  return today.toLocaleDateString("en-US",options);
}
module.exports.getDay=getDay;
function getDay()
{
  let today=new Date();
  let options = { weekday: 'long'};
  return today.toLocaleDateString("en-US",options);
}
