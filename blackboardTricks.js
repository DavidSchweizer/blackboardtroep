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
    let response = await fetch (endpointURL);
    let json = await response.json();
    return json;
}
async function getCourseName(courseId)
{
    let json = await fetchJson("/learn/api/public/v1/courses/"+courseId+"?fields=id,name");
    return json.name;
}

async function getUserId(userName)
{
    let result = "not found"
    let json = await fetchJson("/learn/api/public/v1/users?userName="+userName+"&fields=id,userName")
    json.results.forEach(entry=>{if (userName == entry.userName) result=entry.id})
    return result
}

async function getUserName(userId)
{
    let result = "not found"
    let json = await fetchJson("/learn/api/public/v1/users/"+userId+"?fields=id,userName")
    return json.userName
}

async function getCoursesForId(userName)
{
    let userId = await getUserId(userName);
    let json= await fetchJson("/learn/api/public/v1/users/"+userId+"/courses?fields=courseId");
    return json.results;
}

async function getCoursesForIdWithNames(userName, callback, callbackstr)
{
    let userId = await getUserId(userName);
    let json= await fetchJson("/learn/api/public/v1/users/"+userId+"/courses?fields=courseId");
    let courses=[]; 
    json.results.forEach(course=>
                { getCourseName(course.courseId)
                  .then(nameStr=>callback({courseId:course.courseId, name:nameStr}, callbackstr));
                })
}
/* tot hier werkt t */

function getGradeColumns(courseId)
{
    var r = CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns?fields=id,name")
    return r.results
}

function getUserColumnGrade(courseId, columnId, userId)
{
    var r = CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/users/"+userId)
    return r
}

function getNumberNeedsGrading(courseId, columnId, cutOffDate=DAYZERO)
{
    var r = CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading")
    var result=0
    try { 
            if (r.results.length>0)
            {
                r.results.forEach(entry=>{if (entry.created >= cutOffDate) result++})
            }
            return result
        }
    catch(err) { return 0 }
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
    var columns=getGradeColumns(courseId)
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
