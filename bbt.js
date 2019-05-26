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

function CallEndpointsGetAsynchronous(endpointUrl) 
{
    fetch(endpointUrl)
    .then(response => {
        console.log(response);
        response.json().then(json => { console.log(json);
            uglyReturnValue = JSON.stringify(json);
        })
    })
}

function getCourseName(courseId)
{
    var result = "";
    fetch("/learn/api/public/v1/courses/"+courseId+"?fields=id,name")
    .then(response => {
        response.json().then(json => 
            { console.log(json.name);
              result = json.name;
              console.log("1: " + result);
              return result;
            })
    })
}

