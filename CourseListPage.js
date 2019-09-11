function DisplayCourseListInWindow(Id="david.schweizer@nhlstenden.com")
{
    const CourseListTable = "CourseListTable";
    var windowRef = OpenHTMLWindow("Course List");
    HtmlDocumentBodyWithHeaderAndTable(windowRef, "Courses for ID: "+Id, CourseListTable)
    var tableRef = windowRef.document.getElementById(CourseListTable);
    HtmlInsertTableRow(tableRef, HtmlTableHeadingRow(["CourseId", "Course Name", "Role"]));
    getAndInsertCoursesInformation(Id, tableRef);
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
