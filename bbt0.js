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

function CallEndpointsGetAsynchronous(endpointUrl, callback) 
{
    // fetch(endpointUrl).then(response => {
    //     response.json().then(json => {

    //     })
    // })

    var xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", endpointUrl, true);
    xhr.send(null);
}

function getCourseName(courseId)
{
    CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"?fields=id,name",getCourseName)
    
    return r.name
}

