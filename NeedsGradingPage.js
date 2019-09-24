const DisplayLevelJustCoursesAndTotals      = 0;
const DisplayLevelCoursesColumnsAndTotals   = 1;
const DisplayLevelCoursesColumnsAndStudents = 2;

async function DisplayCoursesThatNeedGradingForLevelInListInWindow(DisplayLevel, courseList=myCourseList, cutOffDate=DAYZERO)
{
    const CoursesNeedGradingTable = "CoursesNeedGradingTable";    
    var windowRef = prepareWindow("Needs Grading", "Courses with Grading Needs", CoursesNeedGradingTable);
    var tableRef = prepareTable(windowRef, CoursesNeedGradingTable, DisplayLevel);
    let GradingInfoForAllCourses = await getNeedsGradingInfoForCourseList(courseList, cutOffDate);
    InsertCourseListNeedsGradingRowsForLevel(DisplayLevel, GradingInfoForAllCourses, tableRef);
}

function prepareTable(windowRef, TableName, DisplayLevel)
{
    const tableHeadings = [
        /* level 0 */["Course", "Needs Grading"],
        /* level 1 */["Course", "Column", "Needs Grading"],
        /* level 2 */["Course: Column", "Student", "Created"]
    ];
    var tableRef = windowRef.document.getElementById(TableName);
    storeDisplayLevel(tableRef, DisplayLevel);
    HtmlInsertTableRow(tableRef, HtmlTableHeadingRow(tableHeadings[DisplayLevel])); 
    return tableRef;
}

function InsertCourseListNeedsGradingRowsForLevel(DisplayLevel, GradingInfoForAllCourses, tableRef)
{
    GradingInfoForAllCourses.forEach(course=>{ InsertCourseNeedsGradingRowsForLevel(DisplayLevel, course, tableRef); });
}

function InsertCourseNeedsGradingRowsForLevel(DisplayLevel, CourseGradingInfo, tableRef)
{
    let first = true;
    GetArrayOfHtmlForCourseNeedsGradingRows(DisplayLevel, CourseGradingInfo).forEach(rowStr =>{
        row = HtmlInsertTableRow(tableRef, rowStr);
        if (first) {
            storeCourseData(row, CourseGradingInfo);
            first = false;
        }
    });
}

function GetArrayOfHtmlForCourseNeedsGradingRows(DisplayLevel, course)
{
    let results = [];
    switch(DisplayLevel)
    {
        case DisplayLevelJustCoursesAndTotals:
            GetArrayOfHtmlForCourseColumnsForLevel0(course, course.columns, results);
            break;
        case DisplayLevelCoursesColumnsAndTotals:
            GetArrayOfHtmlForCourseColumnsForLevel1(course, course.columns, results);
            break;
        case DisplayLevelCoursesColumnsAndStudents:
            GetArrayOfHtmlForCourseColumnsForLevel2(course, course.columns, results);
            break;
        }
    return results;
}

function GetArrayOfHtmlForCourseColumnsForLevel0(course, columnData, results)
{
    results.push(HtmlTableDataRow([course.courseName, course.totalNeedsGrading]));
}

function GetArrayOfHtmlForCourseColumnsForLevel1(course, columnData, results)
{
    let first = true;
    columnData.forEach(column=> 
    {
        results.push(HtmlTableDataRow([first?course.courseName:"", 
            column.columnName, column.needsGrading]));
        first = false;
    });
}

function GetArrayOfHtmlForCourseColumnsForLevel2(course, columnData, results)
{
    columnData.forEach(column=>
    {
        let firstStud = true;
        column.studentDetails.forEach(student=> {
            results.push(HtmlTableDataRow([firstStud?course.courseName + ": " + column.columnName:"", 
                student.student, student.created]));
            firstStud = false;
            })
    })
}

function storeCourseData(row, data)
{
    if (row != undefined)
        row.dataset.courseData = JSON.stringify(data);
}

function storeDisplayLevel(tableRef, DisplayLevel)
{
    tableRef.dataset.level = DisplayLevel;
}
