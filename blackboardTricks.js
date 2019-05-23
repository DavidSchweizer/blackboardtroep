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

function CallEndpointGetSynchronous(endpointUrl)
{
    var t = new XMLHttpRequest()
    t.open("GET", endpointUrl, false)
    t.send()    
    return JSON.parse(t.response)
}

function getUserId(userName)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/users?userName="+userName+"&fields=id,userName")
    let result = "not found"
    r.results.forEach(entry=>{if (userName == entry.userName) result=entry.id})
    return result
}

function getUserName(userId)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/users/"+userId+"?fields=id,userName")
    return r.userName
}

function getCourseName(courseId)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/courses/"+courseId+"?fields=id,name")
    return r.name
}

function getCoursesForId(userName)
{
    return CallEndpointGetSynchronous("/learn/api/public/v1/users/"+getUserId(userName)+"/courses?fields=courseId")
}

function getCoursesForIdWithNames(userName)
{
    var courses = CallEndpointGetSynchronous("/learn/api/public/v1/users/"+getUserId(userName)+"/courses?fields=courseId")
    result=[]
    courses.results.forEach(course=>{ result.push({courseId:course.courseId, name:getCourseName(course.courseId)})});
    return result;
}

function logCoursesForIdWithNames(userName)
{
    var courses = getCoursesForIdWithNames(userName)
    courses.forEach(course=>{ console.log(course.courseId + " \t" + course.name)})
}

function getGradeColumns(courseId)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns?fields=id,name")
    return r.results
}

function getUserColumnGrade(courseId, columnId, userId)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/users/"+userId)
    return r
}

function getNumberNeedsGrading(courseId, columnId, cutOffDate=DAYZERO)
{
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading")
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
    var r = CallEndpointGetSynchronous("/learn/api/public/v1/courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts?attemptStatuses=NeedsGrading")
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

function ViewMyCourseList(cutOffDate=DAYZERO)
{
    var r = getMyCourseListNeedsGrading(cutOffDate)
    console.log("course\tcolumn\tnumber")
    r.forEach(entry=>{console.log(entry.course + "\t" + entry.column +"\t" + entry.number)})
}

