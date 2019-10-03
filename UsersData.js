async function getUsersForCourse(courseId)
{
    let results = [];
    try {
        let courseName = await getCourseName(courseId);
        let json = await fetchJson(getURLforCourseUsers(courseId));
        for (let i = 0; i < json.results.length; i++) 
        {
            let user = json.results[i]; 
            let userName  = await getUserName(user.userId);
            results.push({courseId: courseId, courseName: courseName, 
                user: userName, courseRole: user.courseRoleId,
                lastAccessed: user.lastAccessed, availability: user.availability});
        }
        return JSON.stringify(results);
    }
    catch(err)
    {
        return [];
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
    try {
        let json = await fetchJson(getURLforUserName(userId));
        return BuildUserName(json);
    }
    catch(err)
    {
        return "unknown";
    }
}

function BuildUserName(jsonName)
{
    try {
        let result = jsonName.name.given + " ";
        if (jsonName.name.middle != undefined)
            result  = result + jsonName.name.middle + " ";
        return result + jsonName.name.family;
    }
    catch(err)
    {
        return "unknown";
    }
}