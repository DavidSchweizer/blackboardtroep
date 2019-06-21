function GetStyleAsString()
{
return '<style>'+
'h2 {font-family: Verdana, Geneva, sans-serif;}'+
'table {font-family: Verdana, Geneva, sans-serif;font-size:12px}'+
'th,td { padding-left:2px; padding-right:10px; text-align:left }'+
'td:nth-child(3) {text-align:center}'+
'tr:nth-child(odd) {background-color:#FFF8DC;}'+
'tr:nth-child(even) {background-color:#ADD8E6;}' + 
'</style>';
}
function OpenHTMLWindow(windowTitle) 
{
    var w = window.open("");
    var html1 = '<head><title>'+windowTitle+'</title>'+ GetStyleAsString() + '</head>';
    w.document.head.innerHTML = html1; 
    return w;
}

function _HTML_BodyWithHeaderAndTable(windowRef, headerStr, tableName)
{
    windowRef.document.body.innerHTML = '<body><h2>'+headerStr+'</h2><table id="'+ tableName + '"></table></body>';
}

function _HTMLTableRowHeadingElement(headingStr)
{
    return '<th>'+headingStr + '</th>'
}
function _HTMLTableHeadingRow(ArrayOfHeadingStrings)
{
    let result = '<tr>';
    ArrayOfHeadingStrings.forEach(headingStr=>{result = result + _HTMLTableRowHeadingElement(headingStr);})
    return result + '</tr>';
}

function _HTMLTableRowDataElement(dataStr)
{
    return '<td>'+dataStr + '</td>'
}
function _HTMLTableDataRow(ArrayOfDataStrings)
{
    let result = '<tr>';
    ArrayOfDataStrings.forEach(dataStr=>{result = result + _HTMLTableRowDataElement(dataStr);})
    return result + '</tr>';
}



/***
******************************************************************************
* Course list for (blackboard) ID
*/
async function getCoursesForIdInformation(userName, callback, callbackParam)
{
    let json = await getCoursesForId(userName);
    json.sort((a,b)=>a.courseRoleId.localeCompare(b.courseRoleId))
    .forEach(course=>{
        getCourseName(course.courseId)
        .then(nameStr=>callback({courseId:course.courseId, name:nameStr, role:course.courseRoleId}, callbackParam))})
}

function HTMLMyCourseListTableRowCallBack(entry, tableRef)
{
    tableRef.insertRow().innerHTML = _HTMLTableDataRow([entry.courseId, entry.name, entry.role]);
}
function HTMLMyCourseList(Id)
{
    const CourseListTable = "CourseListTable";
    var windowRef = OpenHTMLWindow("Course List");

    _HTML_BodyWithHeaderAndTable(windowRef, "Courses for ID: "+Id, CourseListTable)
    var tableRef = windowRef.document.getElementById(CourseListTable);
    tableRef.insertRow().innerHTML = _HTMLTableHeadingRow(["CourseId", "Course Name", "Role"]);
    getCoursesForIdInformation(Id, HTMLMyCourseListTableRowCallBack, tableRef);
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



/* level: 0: just courses and totals
          1: courses, columns, totals
          2: courses, columns, student details
*/
function _HTMLCoursesNeedsGradingRows(level, course)
{
    let results = [];
    switch(level)
    {
        case 0:
            results.push(_HTMLTableDataRow([course.courseName, course.totalNeedsGrading]));
            break;
        case 1:
            let first = true;
            course.columns.forEach(column=>
                {
                    results.push(_HTMLTableDataRow([first?course.courseName:"", column.columnName, column.needsGrading]));
                    first = false;
                });
            break;
        case 2:
            course.columns.forEach(column=>
            {
                let firstStud = true;
                column.studentDetails.forEach(student=> {
                    results.push(_HTMLTableDataRow([firstStud?course.courseName + ": " + column.columnName:"", 
                    student.student, student.created]));
                    firstStud = false;
                })
            })
            break;
        }
    return results;
}


function HTMLCoursesNeedGrading(level, courseList=myCourseList, cutOffDate=DAYZERO)
{
    function HTMLCoursesNeedsGradingTableRowCallBack(level, course, tableRef)
    {
        let rows = _HTMLCoursesNeedsGradingRows(level,course);
        rows.forEach(rowStr =>{tableRef.insertRow().innerHTML = rowStr;});
    }    

    const CoursesNeedGradingTable = "CoursesNeedGradingTable";
    const tableHeadings = [
        /* level 0 */["Course", "Needs Grading"],
        /* level 1 */["Course", "Column", "Needs Grading"],
        /* level 2 */["Course: Column", "Student", "Created"]
    ];
    var windowRef = OpenHTMLWindow("Needs Grading");
    _HTML_BodyWithHeaderAndTable(windowRef, "Courses with Grading Needs", CoursesNeedGradingTable);
    var tableRef = windowRef.document.getElementById(CoursesNeedGradingTable);
    tableRef.insertRow().innerHTML = _HTMLTableHeadingRow(tableHeadings[level]);
    getCoursesNeedsGradingForIdInformation(level, courseList, cutOffDate, 
            HTMLCoursesNeedsGradingTableRowCallBack, tableRef);
}
