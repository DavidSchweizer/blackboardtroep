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

async function patchJson(endpointURL, patchJson)
/* kan niet werken omdat Blackboard daar geen toegang voor biedt zonder registratie */
{
    try {
        var x=new XMLHttpRequest();
        x.open("PATCH", "/");
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
function endPointURLgetCourseName(courseId)
{
return APIroot + "courses/"+courseId+"?fields=id,name";
}
function endPointURLgetUserId(userName)
{
    return APIroot + "users?userName="+userName+"&fields=id,userName";
}
function endPointURLgetUserName(userId)
{
    return APIroot + "users/"+userId+"?fields=id,name.given,name.middle,name.family";
}
function endPointURLgetCoursesForId(userId)
{
    return APIroot + "users/"+userId+"/courses?fields=courseId,courseRoleId"; 
}
function endPointURLgetGradeAttemptsColumns(courseId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns?fields=id,name,grading.type";
}
function endPointURLgetNeedsGradingInfoForColumn(courseId, columnId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading";
}
function endPointURLgetUserColumnGrade(courseId, columnId, userId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/users/"+userId;
}

function endPointURLgetUserColumnGradeAttempt(courseId, columnId, attemptId)
{
    return APIroot + "courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts/"+attemptId;
}

function BBURLcourseNeedsGrading(courseId)
{
    return BBroot + "gradebook/do/instructor/viewNeedsGrading?course_id="+courseId;
}
