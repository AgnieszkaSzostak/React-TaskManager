import React, {useEffect} from 'react';
import {put, post} from './TasksProvider'
class TasksManager extends React.Component {
    state = {
        interval: 0,
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
        post(newTask)
            .then(data => this.setState(state => {
                const arr = [data]
                return {
                    tasks: [...arr, ...state.tasks]
                }
            }))
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
    sortTasks = (id) => {
        const newTasks = this.state.tasks.map((task) => task).sort(function compareFunc(a,b) {
            if(b.id === id){
                return -1
            }else if(a.id === id){
                return 1
            }else{
                return 0
            }
        })
        this.setState({
                tasks: newTasks,
        })
    }
    removeHandler = (taskId) => {
        this.setState(state => {
            const newTasks = state.tasks.map((task) => {
                if(task.id === taskId){
                    return {...task, isRemoved: true}
                }
                return task
            })
            return {tasks: newTasks}
        }, ()=> {
                const data = this.state.tasks.find(task => task.id === taskId);
                put(data, taskId);
                this.sortTasks(taskId);
            })
    }
    finishHandler = (taskId) => {
        this.setState(state => {
            const newTasks = state.tasks.map((task) => {
                
                if(task.id === taskId){
                    if(task.isRunning === true){
                        clearInterval(this.state.interval);
                        this.stopHandler(taskId);
                    }
                    return {...task, isDone: true}
                }
                return task
            })
            return {tasks: newTasks}
        }, 
        ()=> {
            const data = this.state.tasks.find(element => element.id === taskId);
            put(data, taskId);
            this.sortTasks(taskId);
        })
    }
    incrementTime = (taskId) =>{
        
        this.state.interval = setInterval(() => {
            this.setState(state => {
                const newTasks = state.tasks.map((task) => {
                    if(task.id === taskId){
                        return {...task, isRunning: true, time: this.setTimer(task.time.counter)}
                    }
                    return task
                })
                return { tasks: newTasks}
            }, () => {
                const data = this.state.tasks.find(element => element.isRunning);
                put(data, taskId);
            })
        }, 1000)
    }
    stopHandler = (taskId) => {
        clearInterval(this.state.interval);
        this.setState(state=> {
            const newTasks = state.tasks.map((task) => {
                if(task.id === taskId){
                    return {...task, isRunning: false}
                }
                return task
            })
            return {tasks: newTasks}
        }, () => {
            const data = this.state.tasks.find(task => task.id === taskId);
            put(data, taskId)
            
        })
    }
    startHandler = (taskId) => {

        if(this.state.tasks.some(task => task.isRunning)){
            const runningTask = this.state.tasks.find(task => task.isRunning);
            this.stopHandler(runningTask.id);
            this.incrementTime(taskId);
        }else{
            this.incrementTime(taskId)
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
                                    <button value="isRunning" disabled={task.isDone} onClick={() => task.isRunning ? this.stopHandler(task.id) : this.startHandler(task.id)}>start/stop</button>
                                    <button value="isDone" disabled={task.isDone} onClick={()=> this.finishHandler(task.id)}>zakończone</button>
                                    <button value="isRemoved" disabled={!task.isDone} onClick={() => this.removeHandler(task.id)}>usuń</button>
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