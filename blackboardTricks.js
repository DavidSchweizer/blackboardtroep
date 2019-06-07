const myCourseList=
[
    {courseId: "_17969_1"} //	Beheer 2
,	{courseId: "_21696_1"} // 	Analytics - Jaar 2 - VT - 2018/2019
,	{courseId: "_18357_1"} // 	Security
,	{courseId: "_19300_1"} // 	Security 1 (2017)
,	{courseId: "_18842_1"} // 	Security 2
,	{courseId: "_21886_1"} // 	FLEX - B HBO ICT - Module Softw.Engineering Concepts
//,	{courseId: "_19668_1"} // 	Afstuderen Informatica
//,	{courseId: "_17485_1"} // 	Stage Opleiding Informatica
,	{courseId: "_17525_1"} // 	Software Development
,	{courseId: "_21692_1"} //   Secure Programming - Jaar 2 - VT - 2018/2019
,	{courseId: "_21694_1"} //   Project IT Risk & Beheer - Jaar 2 - VT - 2018/2019
,	{courseId: "_18812_1"} //	Netwerken
,	{courseId: "_20151_1"} //	Analytics
,	{courseId: "_17071_1"} //	API testing tricks
,	{courseId: "_21752_1"} //	Project Security en Beheer - Jaar 1 - 2018/2019
,	{courseId: "_21754_1"} //	Security - Jaar 1 - VT - 2018/2019
]    
const DAYZERO="2000-1-1"

async function fetchJson(endpointURL)
{
    try {
        let response = await fetch (endpointURL);
        let json = await response.json();
        return json;
    }
    catch(err) {
        return undefined;
    }
}

async function getCourseName(courseId)
{
    let json = await fetchJson(endPointURLgetCourseName(courseId));
    return json.name;
}

async function getUserId(userName)
{
    let result = "not found";
    let json = await fetchJson(endPointURLgetUserId(userName));
    json.results.forEach(entry=>{if (userName == entry.userName) result=entry.id});
    return result;
}

async function getUserName(userId)
{
    let json = await fetchJson(endPointURLgetUserName(userId));
    return json.userName;
}

async function getCoursesForId(userName)
{
    let json = await fetchJson(endPointURLgetCoursesForId(await getUserId(userName)));
    return json.results;
}

async function getCoursesForIdWithNames(userName, callback, callbackstr)
{
    let json = await fetchJson(endPointURLgetCoursesForId(await getUserId(userName)));
    json.results.forEach(course=>
                { getCourseName(course.courseId)
                  .then(nameStr=>callback({courseId:course.courseId, name:nameStr}, callbackstr));
                });
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

async function getNumberNeedsGrading(courseId, columnId, cutOffDate=DAYZERO)
{
    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }

    let json = await fetchJson(endPointURLgetNumberNeedsGrading(courseId, columnId));
    try { return json.results.filter(_filterEntryCreatedOnOrAfter).length; }
    catch(err) { return 0; }
}

async function getNeedsGradingForCourse(courseId, cutOffDate=DAYZERO)
{
    let courseName = await getCourseName(courseId);
    let columns = await getGradeAttemptsColumns(courseId);
    var results=[];
    try 
    {
        columns.forEach(entry=>
            {   getNumberNeedsGrading(courseId, entry.id, cutOffDate)
                .then(needsGrading=>{
                    if (needsGrading>0) 
                    {
			            results.push({courseId:courseId, course:courseName, column:entry.name, number:needsGrading});
                    }
                })
            })				
    }
    catch(err)
    {
        return [];
    }
    return results;
}

/* tot hier werkt t */

function getUserColumnGrade(courseId, columnId, userId)
{
    var r = ("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/users/"+userId)
    return r
}


function getStudentNeedsGrading(courseId, columnId, cutOffDate=DAYZERO)
{
    var r = CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading")
    var result=[]
    try { 
            if (r.results.length>0)
            {
                r.results.forEach(entry=>{
                    if (entry.created >= cutOffDate) 
                        result.push({course: courseId, column: columnId, student:getUserName(entry.userId)})
                })
            }
            return result
        }
    catch(err) { return []}
}

function getNeedsGradingForCourse(courseId, cutOffDate=DAYZERO)
{
    var courseName = getCourseName(courseId)
    console.log("course: "+ courseName + " ("+courseId+")")
    result = []
    var columns=getGradeAttemptsColumns(courseId)
    if (!!columns) {
        columns.forEach(entry=>{ needsGrading = getNumberNeedsGrading(courseId, entry.id, cutOffDate); 
		    					 if (needsGrading>0) {
			    				 	result.push({courseId:courseId, course:courseName, column:entry.name, number:needsGrading});
				    			}
                        })				
        } 
    return result
}
function getStudentNeedsGradingForCourse(courseId, cutOffDate=DAYZERO)
{
    var courseName = getCourseName(courseId)
    console.log("course: "+ courseName + " ("+courseId+")")
    result = []
    var columns=getGradeColumns(courseId)
    if (!!columns) {
        columns.forEach(entry=>{ students = getStudentNeedsGrading(courseId, entry.id, cutOffDate); 
		    					 if (!!students && students.length>0) {
			    				 	students.forEach(entry=>{result.push(entry)});
				    			}
                        })				
        } 
    return result
}
function getNumberNeedsGradingForCourseList(courseList, cutOffDate=DAYZERO)
{
    var result=[]
    courseList.forEach(course=>{ courseResults = getNeedsGradingForCourse(course.courseId, cutOffDate); 
                                try { if (courseResults.length > 0) courseResults.forEach(courseResult=>{result.push(courseResult);})}
                                catch(err) {}
    })
    return result;
}

function getMyCourseListNeedsGrading(cutOffDate=DAYZERO)
{
    return getNumberNeedsGradingForCourseList(myCourseList, cutOffDate)   
}

function getAllNumberNeedsGrading(userName)
{
    r = getCoursesForId(userName)
    return getNumberNeedsGradingForCourseList(r.results)
}
