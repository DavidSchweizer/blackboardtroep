var data = [];

function testCourseName(data)
{
    getCourseName("_20169_1")
    .then (result=>{ console.log("coursename: "+ result); data.push(result);})
}

function testUserId(data)
{
    getUserId("schweize")
    .then(result=>{data.push(result);});
}

function testUserName(data)
{
    getUserName("_114485_1")
    .then(result=>{data.push(result);});
}

function testCoursesForId(resolve)
{
    var data=[];
    getCoursesForId("schweize")
    .then(results=>{resolve(results)})
}

function testCoursesForIdWithNames(data)
{
    getCoursesForIdWithNames("schweize")
    .then(results=>{ results; data.push(results); });    
}

async function tt()
{
    let ttt = await getCoursesForIdWithNames("schweize");
    console.log(ttt.length);
}
function callbackfunc(obj)
{
    console.log("callback; name: " + obj.name);
}

function tt2()
{
    getCoursesForIdWithNames("schweize", callbackfunc);
}
