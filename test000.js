const APIroot2= "/learn/api/public/v2/";
function endPointURLgetUserColumnGradeAttempt(courseId, columnId, attemptId)
{
    return APIroot2 + "courses/"+courseId+"/gradebook/columns/"+columnId+"/attempts/"+attemptId;
}

async function patchJson(endpointURL, data)
{
    try {
        let response = await fetch (endpointURL, {method:'PATCH', body:JSON.stringify(data)});
        if (!response.ok)
        {
            //debugger;
            return undefined;
        }


        let json = await response.json();
        return json;
    }
    catch(err) {
        console.log("error: ");
        console.error(err);
        return undefined;
    }
}

function test0(courseId = "_17071_1", columnId="_234041_1", attemptId="_1099001_1")
{
    return fetchJson(endPointURLgetUserColumnGradeAttempt(courseId,columnId, attemptId));
}
function test(courseId = "_17071_1", columnId="_234041_1", attemptId="_1099001_1")
{
    let json = patchJson(endPointURLgetUserColumnGradeAttempt(courseId,columnId,attemptId),
            {feedback:"feet back!"});
            //{exempt:true});  
    return json;
}
function test3(courseId = "_17071_1", columnId="_234041_1", attemptId="_1099001_1")
{
    fetch(endPointURLgetUserColumnGradeAttempt(courseId,columnId,attemptId), {
        method:'PATCH', body:JSON.stringify({feedback:"feet back!"})})  
    .then(response => response.json())
    .then(data => {
    console.log(data) // Prints result from `response.json()`
    })
    .catch(error => console.error(error))
}