async function getCoursesForIdInformation(userName, callback, callbackParam)
{
    let json = await getCoursesForId(userName);
    json.forEach(course=>
                { getCourseName(course.courseId)
                  .then(nameStr=>callback({courseId:course.courseId, name:nameStr}, callbackParam));
                });
}

var getCoursesNeedsGradingForIdInformationData = {data:[]};
async function getCoursesNeedsGradingForIdInformation(level, courseList, cutOffDate, callback, callbackParam)
{
    let json = await getNeedsGradingInfoForCourseList(courseList, cutOffDate);
    json.forEach(course=>
                { 
                  getCoursesNeedsGradingForIdInformationData.data.push(course);
                  callback(level, course, callbackParam);
                });
}

