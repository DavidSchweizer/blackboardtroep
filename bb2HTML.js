const CoursesNeedGradingTable = "CoursesNeedGradingTable";
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
async function getCoursesForIdInformation(userName, tableRef)
{
    let json = await getCoursesForId(userName);
    json.sort((a,b)=>a.courseRoleId.localeCompare(b.courseRoleId))
    .forEach(course=>{
        getCourseName(course.courseId)
        .then(nameStr=>
            {
                row = tableRef.insertRow();
                row.innerHTML = _HTMLTableDataRow([course.courseId, nameStr, course.courseRoleId]);
                row.dataset.rowData = JSON.stringify(course);
            });
        })
}

function HTMLMyCourseList(Id="schweize")
{
    const CourseListTable = "CourseListTable";
    var windowRef = OpenHTMLWindow("Course List");

    _HTML_BodyWithHeaderAndTable(windowRef, "Courses for ID: "+Id, CourseListTable)
    var tableRef = windowRef.document.getElementById(CourseListTable);
    tableRef.insertRow().innerHTML = _HTMLTableHeadingRow(["CourseId", "Course Name", "Role"]);
    getCoursesForIdInformation(Id, tableRef);
}

function _InsertCourseNeedGradingRows(level, course, tableRef)
{
    let first = true;
    _HTMLCoursesNeedsGradingRows(level, course).forEach(rowStr =>{
        row = tableRef.insertRow();
        row.innerHTML = rowStr;
        if (first) {
            row.dataset.courseData = JSON.stringify(course);
            first = false;
        }
    });
}

async function getCoursesNeedsGradingForIdInformation(level, courseList, cutOffDate, tableRef)
{
    let json = await getNeedsGradingInfoForCourseList(courseList, cutOffDate);
    json.forEach(course=>{ _InsertCourseNeedGradingRows(level, course, tableRef); });
    return json;
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

function _HTMLCoursesNeedGradingHeader(level)
{
    const tableHeadings = [
        /* level 0 */["Course", "Needs Grading"],
        /* level 1 */["Course", "Column", "Needs Grading"],
        /* level 2 */["Course: Column", "Student", "Created"]
    ];
    return _HTMLTableHeadingRow(tableHeadings[level]);
}

function HTMLCoursesNeedGrading(level, courseList=myCourseList, cutOffDate=DAYZERO)
{
    var windowRef = OpenHTMLWindow("Needs Grading");
    _HTML_BodyWithHeaderAndTable(windowRef, "Courses with Grading Needs", CoursesNeedGradingTable);
    var tableRef = windowRef.document.getElementById(CoursesNeedGradingTable);
    tableRef.dataset.level = level;
    tableRef.insertRow().innerHTML = _HTMLCoursesNeedGradingHeader(level);
    getCoursesNeedsGradingForIdInformation(level, courseList, cutOffDate, tableRef);
    HTMLRadioGroupPanel(windowRef);
}

function HTMLRadioGroupPanel(windowRef)
{
    form = windowRef.document.createElement("form");
    for (let level = 0; level <= 2; level++)
    {
        newRadioButton = windowRef.document.createElement("input");
        newRadioButton.setAttribute("type", "radio");
        newRadioButton.setAttribute("name", "level");
        newRadioButton.setAttribute("value", "level"+level);
        form.appendChild(newRadioButton);
    }
    windowRef.document.body.appendChild(form);
}

function HTMLChangeTableLevel(tableRef, newLevel)
{
    if (tableRef.dataset.level == newLevel)
        return;
    tableRef.rows[0].innerHTML = _HTMLCoursesNeedGradingHeader(newLevel);
    let row = 1;
    while (row < tableRef.rows.length)
    {
        courseData = tableRef.rows[row].dataset.courseData;
        let first = true;
        let replace = true;
        _HTMLCoursesNeedsGradingRows(newLevel, JSON.parse(courseData)).forEach(rowStr =>{
            if (replace)
                rowRef = tableRef.rows[row];
            else
                rowRef = tableRef.insertRow();
            rowRef.innerHTML = rowStr;
            if (first) {
                rowRef.dataset.courseData = courseData;
                first = false;
            }
            row++;
            if (row < tableRef.rows.length)
            {
                if (tableRef.rows[row].dataset.courseData != "")
                    replace = false;
            }
        });
        while (row < tableRef.rows.length && tableRef.rows[row].dataset.courseData != "")
        {
            tableRef.rows.deleteRow(row);
        }
    }
    tableRef.dataset.level = newLevel;
}

function ChangeTheLevel(newLevel)
{
    HTMLChangeTableLevel(document.getElementById(CoursesNeedGradingTable), newLevel);
}