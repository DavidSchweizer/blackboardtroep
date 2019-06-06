function GetStyleAsString()
{
/*
table { 
    font-family: Verdana, Geneva, sans-serif;
}
th,td {
    padding-left:2px;
    padding-right:10px;
    text-align:left
}
td:nth-child(3) {text-align:center}
tr:nth-child(odd) {background-color:#FFF8DC;}
tr:nth-child(even) {background-color:#ADD8E6;}
*/
return '<style>'+
'table {font-family: Verdana, Geneva, sans-serif;}'+
'th,td { padding-left:2px; padding-right:10px; text-align:left }'+
'td:nth-child(3) {text-align:center}'+
'tr:nth-child(odd) {background-color:#FFF8DC;}'+
'tr:nth-child(even) {background-color:#ADD8E6;}' + 
'</style>';
}
function GetStyleAsString()
{
return '<style>'+
'h2 {font-family: Verdana, Geneva, sans-serif;}'+
'table {font-family: Verdana, Geneva, sans-serif;}'+
'th,td { padding-left:2px; padding-right:10px; text-align:left }'+
'td:nth-child(3) {text-align:center}'+
'tr:nth-child(odd) {background-color:#FFF8DC;}'+
'tr:nth-child(even) {background-color:#ADD8E6;}' + 
'</style>';
}

function HTMLMyCourseListTableRowCallBack(entry, tableRef)
{
    tableRowStr = '<tr><td>'+entry.courseId+'</td><td>'+entry.name+'</td></tr>';
    var tableRow = tableRef.insertRow();
    tableRow.innerHTML = tableRowStr;
}

function HTMLMyCourseList(Id)
{
    var w = window.open("");
    var html1 =  
        '<head><title>Course List</title>'+
        GetStyleAsString() +
        '</head>';
    w.document.head.innerHTML = html1; 
    w.document.body.innerHTML= '<body><h2>Courses for ID: '+Id+'</h2><table id="CourseListTable"><tr><th>courseId</th><th>course</th></tr></table></body>';
    var tableRef = w.document.getElementById("CourseListTable");
    getCoursesForIdWithNames(Id, HTMLMyCourseListTableRowCallBack, tableRef);
}

function HTMLMyCourseList2(minDate=DAYZERO)
{
    const BBGradeBookLink="https://blackboard.nhlstenden.com/webapps/gradebook/do/instructor/viewNeedsGrading?course_id=";
    var w = window.open("");
    var html1 =  
        '<head><title>Needs Grading per Course</title>'+
        GetStyleAsString() +
        '</head>';
    console.log(html1);
    var html2='<body><table><tr><th>course</th><th>column</th><th>number</th></tr>';
    var r = getMyCourseListNeedsGrading(minDate)
    var curCourse = "";
    r.forEach(entry=>{
                        if (entry.course!= curCourse) 
                        { curCourse = entry.course; courseStr = curCourse; }
                        else 
                        { courseStr = "";}; 
                        html2=html2+'<tr><td><a href='+BBGradeBookLink+entry.courseId+' target=_blank>'+courseStr+'</a></td><td>'+entry.column+'</td><td>'+entry.number+'</td></tr>'});
    html2=html2+'</table></body>';
    console.log(html2);
    w.document.head.innerHTML = html1;
    w.document.body.innerHTML = html2;
}