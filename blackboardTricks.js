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
    json.results.forEach(user=>{if (userName == user.userName) result=user.id});
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
        columns.forEach(column=>
            {   getNumberNeedsGrading(courseId, column.id, cutOffDate)
                .then(needsGrading=>{
                    if (needsGrading>0) 
                    {
			            results.push({courseId:courseId, course:courseName, columnId:column.id, column:column.name, number:needsGrading});
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

async function getUserColumnGrade(courseId, columnId, userId)
{
    return await fetchJson(endPointURLgetUserColumnGrade(courseId, columnId, userId));
}

async function getNeedsGradingInfoForColumn(courseId, columnId, cutOffDate=DAYZERO)
{
    function _filterEntryCreatedOnOrAfter(attempt)
    {
        try { return attempt.created >= cutOffDate; }
        catch(err) { return false;}
    }
    let json = await fetchJson(endPointURLgetNumberNeedsGrading(courseId, columnId));
    var result=[]
    try { 
            json.results.filter(_filterEntryCreatedOnOrAfter).                
            forEach(student=>{
                    getUserName(student.userId)
                    .then(userName=>{result.push({course: courseId, column: columnId, student:userName, studentId: student.userId});})
                    })
            return result;
        }
    catch(err) { return [];}
}
/* tot hier werkt t */

async function _getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
{
    let columns = await getGradeAttemptsColumns(courseId);
    columnIds =[];
    columns.forEach(columnData=>{columnIds.push(columnData.id);})
    var promises = [];
    for (let i = 0; i < columnIds.length; i++) { 
        let promise = await getNeedsGradingInfoForColumn(courseId, columnIds[i], cutOffDate);        
        promises.push(promise); //promise.then(columninfo=>{try {if(columninfo.length>0) promises.push(columninfo); }catch(err){}});
    };
    let allInfo = await Promise.all(promises);
    return allInfo;
}

async function getNeedsGradingInfoForCourse(courseId, cutOffDate=DAYZERO)
{

    function _filterEmpties(columnInfo)
    {
        try { return columnInfo.length > 0; }
        catch(err) { return false;}
    }
    var results = await _getNeedsGradingInfoForCourse(courseId, cutOffDate);    
    return results.filter(_filterEmpties);
}



function getNeedsGradingForCourse(courseId, cutOffDate=DAYZERO)
{
    var courseName = getCourseName(courseId)
    console.log("course: "+ courseName + " ("+courseId+")")
    result = []
    var columns=awaitgetGradeAttemptsColumns(courseId)
    if (!!columns) {
        columns.forEach(entry=>{ needsGrading = getNumberNeedsGrading(courseId, entry.id, cutOffDate); 
		    					 if (needsGrading>0) {
			    				 	result.push({courseId:courseId, course:courseName, column:entry.name, number:needsGrading});
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
