
const url = 'http://localhost:3005/tasks/'

export function put(data){
    const options = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }
    return fetchData(options, data.id);
}
export function post (data){
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    }
    return fetchData(options);
}

function fetchData(options, id = ''){
    const path = url + id;
    const promise = fetch(path, options)
    return promise 
        .then(resp =>{
            if(resp.ok){
                return resp.json()
            }
            return Promise.reject(resp)
        })
        .catch(err => console.error(err))
}