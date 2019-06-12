async function getCoursesForIdInformation(userName, callback, callbackParam)
{
    let json = await getCoursesForId(userName);
    json.forEach(course=>
                { getCourseName(course.courseId)
                  .then(nameStr=>callback({courseId:course.courseId, name:nameStr}, callbackParam));
                });
}
