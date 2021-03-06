/***
 * 
 * JSON object structure of returned course grading objects:
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
async function getNeedsGradingInfoForCourseList(courseList=myCourseList, cutOffDate=DAYZERO)
{
    let allCourses = [];
    for (let i = 0; i < courseList.length; i++)
    {
        console.log(courseList[i].courseName);
        let courseResults = await getResultsForCourse(courseList[i], cutOffDate);
        if (courseResultsIsNotEmpty(courseResults))
        {
            console.log("found: " + courseResults.courseName + " (" + courseResults.totalNeedsGrading + ")");
            allCourses.push(courseResults);        
        }
    }
    console.log("Ready");
    return allCourses;

    function courseResultsIsNotEmpty(courseResults)
    { return courseResults != undefined; }    
}

async function getResultsForCourse(course, cutOffDate)
{
    let courseResults = await getNeedsGradingInfoForCourse(course.courseId, cutOffDate);
    if (courseResultsIsNotEmpty(courseResults))
    {
        courseResults.courseName = course.courseName;
        return courseResults;
    }
    else return undefined;

    function courseResultsIsNotEmpty(courseResults)
    {
        return courseResults != undefined && courseResults.totalNeedsGrading > 0;
    }
}

async function getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
{
    let columnDatas = await getGradeAttemptsColumns(courseId);
    try {
        let courseGradingInfoForAllColumns = [];
        for (let i = 0; i < columnDatas.length; i++) { 
            let needsGradingInfoForColumn = await getNeedsGradingInfoForColumn(courseId, columnDatas[i], cutOffDate);
            if (HasNeedsGradingInfo(needsGradingInfoForColumn))
            {
                courseGradingInfoForAllColumns.push(needsGradingInfoForColumn); 
            }
        };
        return BuildCourseGradingInfoAsObject(courseGradingInfoForAllColumns); 
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
    return {studentId:studentDetail.studentId, created:formatDate(studentDetail.created), 
            student:studentName, attemptId:studentDetail.attemptId};
}        
 
async function getNeedsGradingInfoForColumn(courseId, columnData, cutOffDate=DAYZERO)
{

    var json = await fetchJson(getURLforNeedsGradingInfoForColumn(courseId, columnData.id));
    var result=[];
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(studentDetail=>{
                result.push({course: courseId, column: columnData.id, 
                            columnName: columnData.name, 
                            studentId: studentDetail.userId, created: studentDetail.created, 
                            attemptId: studentDetail.id});
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

