function DisplayCourseListInWindow(Id="david.schweizer@nhlstenden.com")
{
    const CourseListTable = "CourseListTable";
    var windowRef = prepareWindow("Course List", "Courses for ID: "+Id, CourseListTable);    
    var tableRef = prepareTable(windowRef, CourseListTable, ["CourseId", "Course Name", "Role"]);
    getAndInsertCoursesInformation(Id, tableRef);
}

function prepareTable(windowRef, TableName, TableHeaderArray)
{
    var tableRef = windowRef.document.getElementById(TableName);
    HtmlInsertTableRow(tableRef, HtmlTableHeadingRow(TableHeaderArray));    
    return tableRef;
}

async function getAndInsertCoursesInformation(userName, tableRef)
{
    let json = await getCoursesForId(userName);
    json.sort((a,b)=>a.courseRole.localeCompare(b.courseRole))
    .forEach(course=>{
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
