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
function _sortDates(d1, d2)
/* this doesnt work properly) */
{
    var date1  = new Date(d1.created);
    var date2  = new Date(d2.created);
    if (date2.getFullYear() > date1.getFullYear())
        return 1;
    else if (date2.getFullYear() < date1.getFullYear())
        return -1;
    if (date2.getMonth() > date1.getMonth())
        return 1;
    else if (date2.getMonth() < date1.getMonth())
        return -1;
    if (date2.getDate() > date1.getDate())
        return 1;
    else if (date2.getDate() < date1.getDate())
        return -1;
        if (date2.getHours() > date1.getHours())
        return 1;
    else if (date2.getHours() < date1.getHours())
        return -1;
        if (date2.getMinutes() > date1.getMinutes())
        return 1;
    else if (date2.getMinutes() < date1.getMinutes())
        return -1;
    if (date2.getSeconds() > date1.getSeconds())
        return 1;
    else if (date2.getSeconds() < date1.getSeconds())
        return -1;
    return date2.getMilliseconds() - date1.getMilliseconds();    
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
    let result = json.name.given + " ";
    if (json.name.middle != undefined)
        result  = result + json.name.middle + " ";
    return result + json.name.family;
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
            forEach(studentDetail=>{
                result.push({course: courseId, column: columnData.id, columnName: columnData.name, studentId: studentDetail.userId, created: studentDetail.created, attemptId: studentDetail.id});
            });
            return result.sort((a,b)=>{return new Date(b.created) - new Date(a.created);});
//            return result.sort(_sortDates);
}
    catch(err) { console.log("Error: " + err); return [];}
}


async function getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
/***
 * 
 * object structure of returned (promised) object:
 * 
 * .course: course ID
 * .courseName: course description
 * .totalNeedsGrading: total number of attempts that need grading 
 *      note:   this is not necessarily the number the Grade Centre would display
 *              there are several reasons that attempts are not displayed in Grade Centre
 *              but have not yet been graded (there are newer attempts that have been graded, 
 *              so Grade Centre thinks the attempts doesn't need grading)
 * .columns: array of column objects, as follows:
 *          .column: column (test) id 
 *          .columnName: column destription
 *          .needsGrading: number of attempts that need grading for the column
 *          .studentDetails: array of attempt details, as follows:
 *                  .studentId: user Id of the student
 *                  .student: full name of the student (first name + middle + family name)
 *                  .created: date of the attempt
 *                  .attemptId: blackboard id of the attempt
 *          The attempts are sorted on date created (newest first) 
 *              (note: the sorting is not perfect for some reason)
 * 
 ***/
{
    function _CreateColumnObject(columnInfo)
    {
        async function _CreateStudentDetail(StudentDetail, studentDetails)
        {
            studentName = await getUserName(StudentDetail.studentId);
            studentDetails.push({studentId:StudentDetail.studentId, created:formatDate(StudentDetail.created), student:studentName, attemptId:StudentDetail.attemptId})
        }

        let studentDetails=[];
        if (columnInfo.length > 0)
        { 
            columnInfo.forEach(StudentDetail=>{_CreateStudentDetail(StudentDetail, studentDetails)});
            return { column:columnInfo[0].column, 
                columnName:columnInfo[0].columnName, 
                needsGrading: columnInfo.length, 
                studentDetails:studentDetails};
        }
        else return undefined;
    }
    function _CreateCourseObject(courseRawData)
    {
        let courseData = { course:undefined, totalNeedsGrading:0, columns:[]};
        courseRawData.forEach(columnInfo=>{ 
            if (courseData.course == undefined && columnInfo.length > 0)
                courseData.course = columnInfo[0].course;
            let columnData = _CreateColumnObject(columnInfo);            
            if (columnData != undefined && columnData.needsGrading > 0)
            {
                courseData.columns.push(columnData);
                courseData.totalNeedsGrading += columnData.needsGrading;
            }
        });
        return courseData;
    }  
// start main function getNeedsGradingInfoForCourse
    let columnDatas = await getGradeAttemptsColumns(courseId);
    try {
        var promises = [];
        for (let i = 0; i < columnDatas.length; i++) { 
            let promise = await getNeedsGradingInfoForColumn(courseId, columnDatas[i], cutOffDate);        
            promises.push(promise); 
            };
        let allInfo = await Promise.all(promises);
        return _CreateCourseObject(allInfo); 
    }
    catch(err){return undefined;};
}

async function getNeedsGradingInfoForCourseList(courseList=myCourseList, cutOffDate=DAYZERO)
{
    let allCourses = [];
    for (let i = 0; i < courseList.length; i++)
    {
        let course = courseList[i];
        let courseResults = await getNeedsGradingInfoForCourse(course.courseId, cutOffDate);
        if (courseResults != undefined && courseResults.totalNeedsGrading > 0)
        {
            courseResults.courseName = course.courseName;
            console.log("found: " + courseResults.courseName + " (" + courseResults.totalNeedsGrading + ")");
            allCourses.push(courseResults);
        }
    }
    console.log("Ready");
    return allCourses;
}
