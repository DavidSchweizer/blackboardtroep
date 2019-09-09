async function fetchJson(endpointURL)
{
    try {
        let response = await fetch (endpointURL);
        if (IsPageNotFoundOrMaybeOtherError(response))
           return undefined;
        let json = await response.json();
        return json;
    }
    catch(err) {
        return undefined;
    }

    function IsPageNotFoundOrMaybeOtherError(response)
    {
        return !response.ok;
    }
}

function getURLforCourseName(courseId)
{
return APIroot + "courses/"+courseId+"?fields=id,name";
}
function getURLforUserId(userName)
{
    return APIroot + "users?userName="+userName+"&fields=id,userName";
}
function getURLforUserName(userId)
{
    return APIroot + "users/"+userId+"?fields=id,name.given,name.middle,name.family";
}
function getURLforCoursesForId(userId)
{
    return APIroot + "users/"+userId+"/courses?fields=courseId,courseRoleId"; 
}
function getURLforGradeAttemptsColumns(courseId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns?fields=id,name,grading.type";
}
function getURLforNeedsGradingInfoForColumn(courseId, columnId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading";
}
function getURLforUserColumnGrade(courseId, columnId, userId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/users/"+userId;
}
function getURLforUserColumnGradeAttempt(courseId, columnId, attemptId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts/"+attemptId;
}
function BBURLcourseNeedsGrading(courseId)
{
    return BBroot + "gradebook/do/instructor/viewNeedsGrading?course_id="+courseId;
}
