import React from 'react';

class TasksManager extends React.Component {
    state = {
        task: {
            name: '',
            time: {
                hours: '00',
                minutes: '00',
                seconds: '00',
                counter: 0
            },
            isRunning: false,
            isDone: false,
            isRemoved: false,
        },
        tasks: [],
    }
    onClick = () => {
        const { tasks } = this.state;
        console.log(tasks)
    }
    sendTask = e => {
        e.preventDefault();
        const {name} = e.target.elements;
        const newTask = {
            name: name.value,
            time: this.state.task.time,
            isRunning: this.state.task.isRunning,
            isDone: this.state.task.isDone,
            isRemoved: this.state.task.isRemoved

        }
        const options = {
            method: 'POST',
            body: JSON.stringify(newTask),
            headers: {'Content-Type': 'application/json'}
        }

        fetch('http://localhost:3005/tasks', options)
            .then(resp =>{
                if(resp.ok){
                    return resp.json()
                }
                return Promise.reject(resp)
            })
            .then(data => this.setState(state => {
                const arr = [data]
                console.log(arr);
                return {
                    tasks: [...arr, ...state.tasks]
                }
            }))
        
            .catch(err => console.error(err))
    }
    
    changeHandler = e => {
        const { name, value} = e.target
        this.setState(
            this.state.task = {...this.state.task, [name]: value})
    }
    setTimer(counter){
        counter++
        let hrs = Math.floor(counter/3600);
        let mins = Math.floor((counter - (hrs *3600))/ 60)
        let secs = counter % 60;
      
        if(secs < 10){
            secs = '0' + secs
        }
        if(mins < 10){
            mins = '0' + mins
        }
        if(hrs < 10){
            hrs = '0' + hrs
        }
        return {
            hours: hrs,
            minutes: mins,
            seconds: secs,
            counter: counter
        }
    }
    incrementTime(id){
        this.setState(state => {
            const newTasks = state.tasks.map(task=> {
                if(task.id === id){
                    return{...task,
                    isRunning: true, time: this.setTimer(task.time.counter)}
                }
                return task
            })
            return { tasks: newTasks}
        }, ()=>{
   
            const data = this.state.tasks.filter(task => {
                if(task.id === id){
                    return task
                } });
                this.fetchData(data[0], id);
        })
    }
    fetchData(data, id){
        const options = {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }
        fetch(`http://localhost:3005/tasks/${id}`, options)
        .then(resp => resp)
        .catch(err => console.error(err))
    }

    sortTasks(id){
        const newTasks = this.state.tasks.map(task => task).sort(function compareFunc(a,b) {
            if(b.id === id){
                return -1
            }else if(a.id === id){
                return 1
            }else{
                return 0
            }
        })
        this.setState( {
                tasks: newTasks,
            }
        )
    }
    clickHandler = (e, id) => {
        if(e.target.value === 'isDone'){
            this.setState(state => {
                const newTasks = state.tasks.map(task => {
                    if(task.id === id){
                        if(task.isRunning === true){
                            console.log(this.id);
                            clearInterval(this.id);
                        }
                        return {...task, isDone: true, isRunning: false}
                    }
                    return task
                })
                return {tasks: newTasks}
            }, 
            ()=> {
                const data = this.state.tasks.map(task => task);
                this.fetchData(data[0], id);
                this.sortTasks(id);
            })
        }
        if(e.target.value === 'isRunning'){
            this.state.tasks.forEach(task => {
                if(task.id !== id){
                    if(task.isRunning === true){
                        this.setState(state => {
                            const newTasks = state.tasks.map(task => {
                                if(task.id !==id && task.isRunning === true){
                                    console.log('here it is', this.id);
                                    clearInterval(this.id);
                                    return {...task, isRunning: false}
                                }
                                return task
                            })
                            return {tasks: newTasks}
                        })
                    }
                }
            });
            this.state.tasks.forEach(task => {
                if(task.id === id){
                    if(task.isRunning === true){
                        this.setState(state => {
                            const newTasks =state.tasks.map(task => {
                                if(task.id === id && task.isRunning ===true){
                                    clearInterval(this.id);
                                    return {...task, isRunning: false}
                                }
                                return task
                            })
                            return {tasks: newTasks}
                        })
                    }else{
                        this.id = setInterval(()=> {
                            this.incrementTime(id)
                        }, 1000)
                    }
                }
            })
        }
        if(e.target.value === 'isRemoved'){
            this.setState(state => {
                const newTasks = state.tasks.map(task => {
                    if(task.id === id){
                        return {...task, isRemoved: true}
                    }
                    return task
                })
                return {tasks: newTasks}
            })
        }
    }
    render() {
        return (
            <>
                <section>
                    <h1 onClick={ this.onClick }>TasksManager</h1>
                    <form onSubmit={this.sendTask}>
                        <label htmlFor="task">Task name: </label>
                        <input name="name" value={this.state.task.name} onChange={this.changeHandler} />
                        <input type="submit" />
                    </form>
                </section>
                {this.state.tasks.map((task) => {
                    if(task.isRemoved === false){
                        return (
                            <section key={task.id}>
                                <header>{task.name} timer: {task.time.hours}:{task.time.minutes}:{task.time.seconds}</header>
                                <footer>
                                    <button value="isRunning" disabled={task.isDone}onClick={(e)=>this.clickHandler(e, task.id)}>start/stop</button>
                                    <button value="isDone" disabled={task.isDone} onClick={(e)=> this.clickHandler(e, task.id)}>zakończone</button>
                                    <button value="isRemoved" disabled={!task.isDone} onClick={(e) => this.clickHandler(e, task.id)}>usuń</button>
                                </footer>
                            </section>
                        )
                    }
                })}
            </>
        )
    }
}

export default TasksManager;