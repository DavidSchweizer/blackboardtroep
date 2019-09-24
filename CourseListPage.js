async function DisplayCourseListInWindow(UserName="david.schweizer@nhlstenden.com")
{
    const CourseListTable = "CourseListTable";
    var windowRef = prepareWindow("Course List", "Courses for ID: "+UserName, CourseListTable);    
    var tableRef = prepareTable(windowRef, CourseListTable, ["CourseId", "Course Name", "Role"]);
    let CoursesInformation = await getCoursesInformation(UserName);
    InsertCoursesInformation(CoursesInformation, tableRef);
}

function prepareTable(windowRef, TableName, TableHeaderArray)
{
    var tableRef = windowRef.document.getElementById(TableName);
    HtmlInsertTableRow(tableRef, HtmlTableHeadingRow(TableHeaderArray));    
    return tableRef;
}

async function getCoursesInformation(userName)
{
    let CoursesInformation = await getCoursesForId(userName);
    return CoursesInformation.sort((a,b)=>a.courseRole.localeCompare(b.courseRole));
}

async function InsertCoursesInformation(CoursesInformation, tableRef)
{    
    CoursesInformation.forEach(course=>{
    getCourseName(course.courseId)
    .then(nameStr=>
        {
            row = HtmlInsertTableRow(tableRef,  
                HtmlTableDataRow([course.courseId, nameStr, course.courseRole]));
            storeRowData(row, course);
        });
    })
}

function storeRowData(row, data)
{
    if (row != undefined)
        row.dataset.rowData = JSON.stringify(data);
}
