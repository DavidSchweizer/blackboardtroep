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

async function fetchJson(endpointURL)
{
    try {
        let response = await fetch (endpointURL);
        if (!response.ok)
            return undefined;
        let json = await response.json();
        return json;
    }
    catch(err) {
        return undefined;
    }
}

async function getCourseName(courseId)
{
    let myIndex = myCourseList.map(function(e) { return e.courseId; }).indexOf(courseId);
    if (myIndex == -1)
    {
        let json = await fetchJson(endPointURLgetCourseName(courseId));
        return json.name;
    }
    else 
        return myCourseList[myIndex].courseName;
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

async function getNeedsGradingInfoForColumn(courseId, columnData, cutOffDate=DAYZERO)
{
    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }
    let json = await fetchJson(endPointURLgetNeedsGradingInfoForColumn(courseId, columnData.id));
    var result=[]
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(student=>{
                    getUserName(student.userId)
                    .then(userName=>{result.push({course: courseId, column: columnData.id, columnName: columnData.name, studentId: student.userId, studentId: student.userId, student:userName});})
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
    let columnDatas = await getGradeAttemptsColumns(courseId);
    try {
        var promises = [];
        for (let i = 0; i < columnDatas.length; i++) { 
            let promise = await getNeedsGradingInfoForColumn(courseId, columnDatas[i], cutOffDate);        
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

async function getNeedsGradingInfoForCourseList(courseList, cutOffDate=DAYZERO)
{
    let rawData = [];
    for (let i = 0; i < courseList.length; i++)
    {
        let course = courseList[i];
        let courseResults = await getNeedsGradingInfoForCourse(course.courseId, cutOffDate);
        if (courseResults.length > 0)
        {
            rawData.push(courseResults);
        }
    }
    let results = [];
    rawData.forEach(courseRawData=>
        {
            let courseData = {course:courseRawData[0][0].course, totalNeedsGrading:0, columns:[]};
            courseRawData.forEach(courseColumn=>{
                let students=[];
                courseColumn.forEach(
                    studentInfo=>{students.push({studentId:studentInfo.studentId, student:studentInfo.student})});
                let columnData={column:courseColumn[0].column, columnName:courseColumn[0].columnName, needsGrading: courseColumn.length, students:students};
                courseData.columns.push(columnData);
                courseData.totalNeedsGrading += columnData.needsGrading;
            });
            results.push(courseData);
        });
    return results;
}
