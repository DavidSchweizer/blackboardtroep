async function getCoursesForId(userName)
{
    let results = [];
    try {
        let json = await fetchJson(getURLforCoursesForId(await getUserId(userName)));
        for (let i = 0; i < json.results.length; i++) 
        {
            let course = json.results[i];            
            let courseName = await getCourseName(course.courseId);
            results.push({courseId: course.courseId, courseName: courseName, courseRole: course.courseRoleId});
        }
        return results;
    }
    catch(err)
    {
        return [];
    }
}
async function getCourseName(courseId)
{
    let myIndex = findCourseIDinCourseList(courseId);
    if (IDisInCourseList(myIndex))
        return myCourseList[myIndex].courseName;
    else
    {
        let json = await fetchJson(getURLforCourseName(courseId));
        return json.name;
    } 
        
    function IDisInCourseList(index)
    {
        return index != -1;
    }
    function findCourseIDinCourseList(courseId)
    {
       return myCourseList.map(function(e) { return e.courseId; }).indexOf(courseId);
    }         
}

const myCourseList=
[
    {courseId: "_17969_1", courseName: "Beheer 2"}
,	{courseId: "_21696_1", courseName: "Analytics - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_18357_1", courseName: "Security"}
,	{courseId: "_19300_1", courseName: "Security 1 (2017)"}
,	{courseId: "_18842_1", courseName: "Security 2"}
,	{courseId: "_21886_1", courseName: "FLEX - B HBO ICT - Module Softw.Engineering Concepts"}
,	{courseId: "_17525_1", courseName: "Software Development"}
,	{courseId: "_21692_1", courseName: "Secure Programming - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_21694_1", courseName: "Project IT Risk & Beheer - Jaar 2 - VT - 2018/2019"}
,	{courseId: "_18812_1", courseName: "Netwerken"}
,	{courseId: "_20151_1", courseName: "Analytics"}
,	{courseId: "_17071_1", courseName: "API testing tricks"}
,	{courseId: "_21752_1", courseName: "Project Security en Beheer - Jaar 1 - 2018/2019"}
,	{courseId: "_21754_1", courseName: "Security - Jaar 1 - VT - 2018/2019"}
];