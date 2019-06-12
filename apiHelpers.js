async function getCoursesForIdInformation(userName, callback, callbackParam)
{
    let json = await fetchJson(endPointURLgetCoursesForId(await getUserId(userName)));
    json.results.forEach(course=>
                { getCourseName(course.courseId)
                  .then(nameStr=>callback({courseId:course.courseId, name:nameStr}, callbackParam));
                });
}

