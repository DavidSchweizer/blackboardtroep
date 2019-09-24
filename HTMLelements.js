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

function prepareWindow(WindowHeader, TableHeader, TableName)
{
    var windowRef = OpenHTMLWindow(WindowHeader);
    HtmlDocumentBodyWithHeaderAndTable(windowRef, TableHeader, TableName);
    return windowRef;
}

function OpenHTMLWindow(windowTitle) 
{
    var windowRef = window.open("");
    var html1 = '<head><title>'+windowTitle+'</title>'+ GetStyleAsString() + '</head>';
    windowRef.document.head.innerHTML = html1; 
    return windowRef;
}

function HtmlInsertTableRow(tableRef, tableHTML)
{
    let row = tableRef.insertRow();
    row.innerHTML = tableHTML;
    return row;
}

function HtmlDocumentBodyWithHeaderAndTable(windowRef, headerStr, tableName)
{
    windowRef.document.body.innerHTML = '<body><h2>'+headerStr+'</h2><table id="'+ tableName + '"></table></body>';
}

function HtmlTableRowHeadingElement(headingStr)
{
    return '<th>'+headingStr + '</th>'
}
function HtmlTableHeadingRow(ArrayOfHeadingStrings)
{
    console.log("Joepie: "+ JSON.stringify(ArrayOfHeadingStrings));
    let result = '<tr>';
    ArrayOfHeadingStrings.forEach(headingStr=>{result = result + HtmlTableRowHeadingElement(headingStr);})
    return result + '</tr>';
}

function HtmlTableRowDataElement(dataStr)
{
    return '<td>'+dataStr + '</td>'
}
function HtmlTableDataRow(ArrayOfDataStrings)
{
    let result = '<tr>';
    ArrayOfDataStrings.forEach(dataStr=>{result = result + HtmlTableRowDataElement(dataStr);})
    return result + '</tr>';
}

