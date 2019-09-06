async function getNeedsGradingInfoForCourseList(courseList=myCourseList, cutOffDate=DAYZERO)
{
    let allCourses = [];
    for (let i = 0; i < courseList.length; i++)
    {
        let course = courseList[i];
        console.log(course.courseName);
        let courseResults = await getNeedsGradingInfoForCourse(course.courseId, cutOffDate);
        if (courseResultsIsNotEmpty(courseResults))
        {
            courseResults.courseName = course.courseName;
            console.log("found: " + courseResults.courseName + " (" + courseResults.totalNeedsGrading + ")");
            allCourses.push(courseResults);
        }
    }
    console.log("Ready");
    return allCourses;
}

function courseResultsIsNotEmpty(courseResults)
{
    return courseResults != undefined && courseResults.totalNeedsGrading > 0;
}

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
async function getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
{
    let columnDatas = await getGradeAttemptsColumns(courseId);
    try {
        let CourseGradingInfoForAllColumns = [];
        for (let i = 0; i < columnDatas.length; i++) { 
            let needsGradingInfoForColumn = await getNeedsGradingInfoForColumn(courseId, columnDatas[i], cutOffDate);
            if (HasNeedsGradingInfo(needsGradingInfoForColumn))
            {
                CourseGradingInfoForAllColumns.push(needsGradingInfoForColumn); 
            }
        };
        return BuildCourseGradingInfoAsObject(CourseGradingInfoForAllColumns); 
    }
    catch(err){return undefined;};
    
    function HasNeedsGradingInfo(promise)
    {return promise.length > 0;}
}

async function BuildCourseGradingInfoAsObject(CourseGradingInfoForAllColumns)
{
    let result = { course:undefined, totalNeedsGrading:0, columns:[]};
    for (let i = 0; i < CourseGradingInfoForAllColumns.length; i++)
    {    
        let courseGradingInfoForColumn = CourseGradingInfoForAllColumns[i];
        if (ColumnHasAttemptData(courseGradingInfoForColumn))
        {
            if (CourseInfoNotInitialized(result))
                result.course = courseGradingInfoForColumn[0].course;
            let columnGradingInfoAsObject = await BuildColumnGradingInfoAsObject(courseGradingInfoForColumn);            
            if (ColumnHasNeedsGrading(columnGradingInfoAsObject))
            {
                result.columns.push(columnGradingInfoAsObject);
                result.totalNeedsGrading += columnGradingInfoAsObject.needsGrading;
            }
        }
    };
    return result;

    function CourseInfoNotInitialized(courseData)
    { return courseData.course == undefined; }

    function ColumnHasAttemptData(columnInfo)
    { return columnInfo.length > 0; }

    function ColumnHasNeedsGrading(columnData)
    { return columnData.needsGrading > 0; }
}

async function BuildColumnGradingInfoAsObject(columnInfo)
{
    var studentDetails = [];
    for (let i = 0; i < columnInfo.length; i++)
    {
        detail = await BuildStudentDetailInfoAsObject(columnInfo[i]);
        studentDetails.push(detail);        
    }
    return { column:columnInfo[0].column, 
             columnName:columnInfo[0].columnName, 
             needsGrading: columnInfo.length, 
             studentDetails:studentDetails};
}

async function BuildStudentDetailInfoAsObject(studentDetail)
{
    studentName = await getUserName(studentDetail.studentId);
    return {studentId:studentDetail.studentId, created:formatDate(studentDetail.created), student:studentName, attemptId:studentDetail.attemptId};
}        
 
async function getNeedsGradingInfoForColumn(courseId, columnData, cutOffDate=DAYZERO)
{

    var json = await fetchJson(getURLforNeedsGradingInfoForColumn(courseId, columnData.id));
    var result=[]
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(studentDetail=>{
                result.push({course: courseId, column: columnData.id, columnName: columnData.name, studentId: studentDetail.userId, created: studentDetail.created, attemptId: studentDetail.id});
            });
            return result.sort((a,b)=>{return new Date(b.created) - new Date(a.created);});
    }
    catch(err) { console.log("Error: " + err); return [];}

    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }
}

async function getGradeAttemptsColumns(courseId)
{
    let json = await fetchJson(getURLforGradeAttemptsColumns(courseId));
    try {   
        return json.results.filter(_filterGradingTypeIsAttempts);
    }
    catch(err) {
        return undefined;
    }

    function _filterGradingTypeIsAttempts(column)
    {
        try {return column.grading.type == "Attempts";}
        catch(err) {return false;}
    }
}

async function getCourseName(courseId)
{
    let myIndex = findCourseIDinCourseList(courseId);
    if (IDisInCourseList(myIndex))
    {
        let json = await fetchJson(getURLforCourseName(courseId));
        return json.name;
    }
    else 
        return myCourseList[myIndex].courseName;
    function IDisInCourseList(index)
    {
        return index != -1;
    }
    function findCourseIDinCourseList(courseId)
    {
       return myCourseList.map(function(e) { return e.courseId; }).indexOf(courseId);
    }         
}

async function getUserId(userName)
{
    let result = "not found";
    let json = await fetchJson(getURLforUserId(userName));
    json.results.forEach(user=>{if (userName == user.userName) result=user.id});
    return result;
}

async function getUserName(userId)
{
    dit werkt niet goed als de user niet bestaat (404 error)

    try {
        let json = await fetchJson(getURLforUserName(userId));
        let result = json.name.given + " ";
        if (json.name.middle != undefined)
            result  = result + json.name.middle + " ";
        return result + json.name.family;
    }
    catch(err)
    {
        return undefined;
    }
}

async function getCoursesForId(userName)
{
    try {
        let json = await fetchJson(getURLforCoursesForId(await getUserId(userName)));
        return json.results;
    }
    catch(err)
    {
        return [];
    }
}
