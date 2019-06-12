const myCourseList=
[
    {courseId: "_17969_1"} //	Beheer 2
,	{courseId: "_21696_1"} // 	Analytics - Jaar 2 - VT - 2018/2019
,	{courseId: "_18357_1"} // 	Security
,	{courseId: "_19300_1"} // 	Security 1 (2017)
,	{courseId: "_18842_1"} // 	Security 2
,	{courseId: "_21886_1"} // 	FLEX - B HBO ICT - Module Softw.Engineering Concepts
//,	{courseId: "_19668_1"} // 	Afstuderen Informatica
//,	{courseId: "_17485_1"} // 	Stage Opleiding Informatica
,	{courseId: "_17525_1"} // 	Software Development
,	{courseId: "_21692_1"} //   Secure Programming - Jaar 2 - VT - 2018/2019
,	{courseId: "_21694_1"} //   Project IT Risk & Beheer - Jaar 2 - VT - 2018/2019
,	{courseId: "_18812_1"} //	Netwerken
,	{courseId: "_20151_1"} //	Analytics
,	{courseId: "_17071_1"} //	API testing tricks
,	{courseId: "_21752_1"} //	Project Security en Beheer - Jaar 1 - 2018/2019
,	{courseId: "_21754_1"} //	Security - Jaar 1 - VT - 2018/2019
]    
const DAYZERO="2000-1-1"

async function fetchJson(endpointURL)
{
    try {
        let response = await fetch (endpointURL);
        let json = await response.json();
        return json;
    }
    catch(err) {
        return undefined;
    }
}

async function getCourseName(courseId)
{
    let json = await fetchJson(endPointURLgetCourseName(courseId));
    return json.name;
}

async function getUserId(userName)
{
    let result = "not found";
    let json = await fetchJson(endPointURLgetUserId(userName));
    json.results.forEach(user=>{if (userName == user.userName) result=user.id});
    return result;
}

async function getUserName(userId)
{
    let json = await fetchJson(endPointURLgetUserName(userId));
    return json.userName;
}

async function getCoursesForId(userName)
{
    let json = await fetchJson(endPointURLgetCoursesForId(await getUserId(userName)));
    return json.results;
}

async function getGradeAttemptsColumns(courseId)
{
    function _filterGradingTypeIsAttempts(column)
    {
        try {return column.grading.type == "Attempts";}
        catch(err) {return false;}
    }

    let json = await fetchJson(endPointURLgetGradeAttemptsColumns(courseId));
    try {
        return json.results.filter(_filterGradingTypeIsAttempts);
    }
    catch(err) {
        return undefined;
    }
}

async function getUserColumnGrade(courseId, columnId, userId)
{
    return await fetchJson(endPointURLgetUserColumnGrade(courseId, columnId, userId));
}

async function getNeedsGradingInfoForColumn(courseId, columnId, cutOffDate=DAYZERO)
{
    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }
    let json = await fetchJson(endPointURLgetNeedsGradingInfoForColumn(courseId, columnId));
    var result=[]
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(student=>{
                    getUserName(student.userId)
                    .then(userName=>{result.push({course: courseId, column: columnId, student:userName, studentId: student.userId});})
                    })
            return result;
        }
    catch(err) { return [];}
}

async function getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
{
    function _filterEmpties(columnInfo)
    {
        try { return columnInfo.length > 0; }
        catch(err) { return false;}
    }
    let columns = await getGradeAttemptsColumns(courseId);
    columnIds =[];
    try {
        columns.forEach(columnData=>{columnIds.push(columnData.id);})
        var promises = [];
        for (let i = 0; i < columnIds.length; i++) { 
            let promise = await getNeedsGradingInfoForColumn(courseId, columnIds[i], cutOffDate);        
            promises.push(promise); 
            };
        let allInfo = await Promise.all(promises);
        return allInfo.filter(_filterEmpties);
    }
    catch(err){return [];};
}

async function getNeedsGradingForCourse(courseId, cutOffDate=DAYZERO)
{
    let columnInfos = await getNeedsGradingInfoForCourse(courseId, cutOffDate);
    var result = 0;
    try { columnInfos.forEach(columnInfo=>{result += columnInfo.length; }) }
    catch(err) {}
    return result;
}

async function getNeedsGradingForCourseList(courseList, cutOffDate=DAYZERO)
{
    var results = [];
    for (let i = 0; i < courseList.length; i++)
    {
        let course = courseList[i];
        let number = await getNeedsGradingForCourse(course.courseId, cutOffDate);
        if (number > 0)
        {
            results.push({course:course.courseId, needsGrading:number});
        }
    }
    return results;
}
