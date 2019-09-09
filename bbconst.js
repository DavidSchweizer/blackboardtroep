const APIroot= "/learn/api/public/v1/";
const BBroot = "https://blackboard.nhlstenden.com/webapps/"

const DAYZERO="2000-1-1"
function formatDate(dateString) 
{
    var date = new Date(dateString);
    var hours = date.getHours();
    var day = date.getDate();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes;
    return day + "-" + (1+date.getMonth()) + "-" + date.getFullYear() + "  " + strTime;
}
