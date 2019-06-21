const APIroot= "/learn/api/public/v1/";
//  const APIroot2= "/learn/api/public/v2/";
const BBroot = "https://blackboard.nhlstenden.com/webapps/"

const myCourseList=
[
    {courseId: "_17969_1", courseName: "Beheer 2"}
,	{courseId: "_21696_1", courseName: "Analytics - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_18357_1", courseName: "Security"}
,	{courseId: "_19300_1", courseName: "Security 1 (2017)"}
,	{courseId: "_18842_1", courseName: "Security 2"}
,	{courseId: "_21886_1", courseName: "FLEX - B HBO ICT - Module Softw.Engineering Concepts"}
//,	{courseId: "_19668_1", courseName: "Afstuderen Informatica"}
//,	{courseId: "_17485_1", courseName: "Stage Opleiding Informatica"}
,	{courseId: "_17525_1", courseName: "Software Development"}
,	{courseId: "_21692_1", courseName: "Secure Programming - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_21694_1", courseName: "Project IT Risk & Beheer - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_18812_1", courseName: "Netwerken"}
,	{courseId: "_20151_1", courseName: "Analytics"}
,	{courseId: "_17071_1", courseName: "API testing tricks"}
,	{courseId: "_21752_1", courseName: "Project Security en Beheer - Jaar 1 - 2018/2019"}
,	{courseId: "_21754_1", courseName: "Security - Jaar 1 - VT - 2018/2019"}
];
const DAYZERO="2000-1-1"
function formatDate(dateString) 
{
    var date = new Date(dateString);
    var hours = date.getHours();
    var day = date.getDate();
    /*if (hours == 0)
    {
        hours = 24;
        day = day - 1;
    }*/
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes;
    return day + "-" + (1+date.getMonth()) + "-" + date.getFullYear() + "  " + strTime;
}
