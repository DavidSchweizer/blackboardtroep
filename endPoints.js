const APIroot= "/learn/api/public/v1/";

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
    return APIroot + "users/"+userId+"?fields=id,userName";
}
function endPointURLgetCoursesForId(userId)
{
    return APIroot + "users/"+userId+"/courses?fields=courseId"; 
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
