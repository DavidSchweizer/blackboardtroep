function xhrSuccess() { 
    this.callback.apply(this); 
}

function xhrError() { 
    console.error(this.statusText); 
}

function ReturnValues(xhr)
{
    var json = JSON.parse(xhr.response);
    return json;
}

function CallEndpointsGetAsynchronous(endpointUrl) 
{
    var xhr = new XMLHttpRequest();
    xhr.callback = ReturnValues;
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", endpointUrl, true);
    xhr.send(null);
}

function getCourseName(courseId)
{
    var r = CallEndpointsGetAsynchronous("/learn/api/public/v1/courses/"+courseId+"?fields=id,name")
    return r.name
}

