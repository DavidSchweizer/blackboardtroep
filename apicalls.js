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
