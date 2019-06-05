function xhrSuccess() { 
    this.callback.call(this); 
}

function xhrError() { 
    console.error(this.statusText); 
}

var uglyReturnValue = "";

function ReturnValues()
{
    var json = JSON.parse(this.response);
    console.log("ReturnValues: "+json);
    console.log("ReturnValues2: "+this.response);
    uglyReturnValue= JSON.stringify(json);
}

async function CallEndpointsGetAsynchronous(endpointUrl) 
{
    fetch(endpointUrl)
    .then(response => response.json())
    .then(data => { console.log("return data: "+data.name); this.result = data.name;        
    })
}

/*async function getCourseName(courseId)
{
   fetch ("/learn/api/public/v1/courses/"+courseId+"?fields=id,name")
   .then(response => {console.log("response"); response.json()})
   .then(json => { console.log("data: "+ json) })
}
*/

async function fetchJson(endpointURL)
{
    let response = await fetch (endpointURL);
    let json = await response.json();
    return json;
}
async function getCourseName(courseId)
{
    let json = await fetchJson("/learn/api/public/v1/courses/"+courseId+"?fields=id,name");
    return json.name;
}

function test(data)
{
    getCourseName("_20169_1")
    .then (result=>{ console.log("coursename: "+ result); data.push(result);})
}
