async function getNeedsGradingInfoForCourseList(courseList=myCourseList, cutOffDate=DAYZERO)
{
    let allCourses = [];
    for (let i = 0; i < courseList.length; i++)
    {
        let course = courseList[i];
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
    let columnDatas = await getGradeAttemptsColumns(courseId);
    try {
        var promises = [];
        for (let i = 0; i < columnDatas.length; i++) { 
            let promise = await getNeedsGradingInfoForColumn(courseId, columnDatas[i], cutOffDate);        
            promises.push(promise); 
            };
        let CourseGradingInfoForAllColumns = await Promise.all(promises);
        return BuildCourseGradingInfoAsObject(CourseGradingInfoForAllColumns); 
    }
    catch(err){return undefined;};
}

function BuildCourseGradingInfoAsObject(CourseGradingInfoForAllColumns)
{
    let result = { course:undefined, totalNeedsGrading:0, columns:[]};
    CourseGradingInfoForAllColumns.forEach(columnInfo=>{ 
        if (CourseHasColumns(columnInfo))
        {
            if (CourseInfoNotInitialized(result))
                result.course = columnInfo[0].course;
            let columnData = BuildColumnGradingInfoAsObject(columnInfo);            
            if (columnHasNeedsGrading(columnData))
            {
                result.columns.push(columnData);
                result.totalNeedsGrading += columnData.needsGrading;
            }
        }
    });
    return result;
}

function BuildColumnGradingInfoAsObject(columnInfo)
{
    let studentDetails=[];
    columnInfo.forEach(studentDetail=>{BuildStudentDetailInfoAsObject(studentDetail, studentDetails)});
    return { column:columnInfo[0].column, 
             columnName:columnInfo[0].columnName, 
             needsGrading: columnInfo.length, 
             studentDetails:studentDetails};
}

async function BuildStudentDetailInfoAsObject(studentDetail, studentDetails)
{
    studentName = await getUserName(studentDetail.studentId);
    studentDetails.push({studentId:studentDetail.studentId, created:formatDate(studentDetail.created), student:studentName, attemptId:studentDetail.attemptId})
}        
 
function CourseInfoNotInitialized(courseData)
{ return courseData.course == undefined; }

function CourseHasColumns(columnInfo)
{ return columnInfo.length > 0; }

function ColumnHasNeedsGrading(columnData)
{ return columnData.needsGrading > 0; }

async function getNeedsGradingInfoForColumn(courseId, columnData, cutOffDate=DAYZERO)
{
    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }
    let json = await fetchJson(getURLforNeedsGradingInfoForColumn(courseId, columnData.id));
    var result=[]
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(studentDetail=>{
                result.push({course: courseId, column: columnData.id, columnName: columnData.name, studentId: studentDetail.userId, created: studentDetail.created, attemptId: studentDetail.id});
            });
            return result.sort((a,b)=>{return new Date(b.created) - new Date(a.created);});
}
    catch(err) { console.log("Error: " + err); return [];}
}

async function getGradeAttemptsColumns(courseId)
{
    function _filterGradingTypeIsAttempts(column)
    {
        try {return column.grading.type == "Attempts";}
        catch(err) {return false;}
    }

    let json = await fetchJson(getURLforGradeAttemptsColumns(courseId));
    try {   
        return json.results.filter(_filterGradingTypeIsAttempts);
    }
    catch(err) {
        return undefined;
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
}
function findCourseIDinCourseList(courseId)
{
   return myCourseList.map(function(e) { return e.courseId; }).indexOf(courseId);
}
function IDisInCourseList(index)
{
    return index != -1;
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
    let json = await fetchJson(getURLforUserName(userId));
    let result = json.name.given + " ";
    if (json.name.middle != undefined)
        result  = result + json.name.middle + " ";
    return result + json.name.family;
}

async function getCoursesForId(userName)
{
    let json = await fetchJson(getURLforCoursesForId(await getUserId(userName)));
    return json.results;
}

