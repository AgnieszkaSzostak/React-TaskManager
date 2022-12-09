import React from 'react';
import {put, post} from './TasksProvider'
class TasksManager extends React.Component {
    state = {
        task: {
            name: '',
            time: 0,
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
    createTimer(time){
        let hrs = Math.floor(time/3600);
        let mins = Math.floor((time - (hrs *3600))/ 60)
        let secs = time % 60;
      
        if(secs < 10){
            secs = '0' + secs
        }
        if(mins < 10){
            mins = '0' + mins
        }
        if(hrs < 10){
            hrs = '0' + hrs
        }
        return `${hrs}:${mins}:${secs}`
        
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
    stopHandler = (taskId) => {
        clearInterval(this.interval);
        this.interval = null;
        this.setState(state=> {
            const newTasks = state.tasks.map((task) => {
                if(task.id === taskId){
                    return {...task, isRunning: false}
                }
                return task
            })
            return { tasks: newTasks}
        }, () => {
            const data = this.state.tasks.find(task => task.id === taskId);
            put(data, taskId)
        })
    }
    startHandler = (taskId) => {
       this.interval = setInterval(()=> {
           this.setState(state => {
               const newTasks = state.tasks.map((task) => {
                   if(task.id === taskId){
                       return {...task, isRunning: true, time: task.time + 1}
                   }
                   return task
               })
               return { tasks: newTasks}
           }, () => {
               const data = this.state.tasks.find(element => element.isRunning);
               put(data, taskId);
           })
        },1000)
        
    }
    render() {
        return (
            <>
                <section className="manager">
                    <h1 className="manager__headline" onClick={ this.onClick }>TasksManager</h1>
                    <form className="form" onSubmit={this.sendTask}>
                        <input className="form__input" required="required" type="text" name="name" value={this.state.task.name} onChange={this.changeHandler} />
                        <label className="form__label"htmlFor="task">Task name</label>
                        <input type="submit" />
                    </form>
                </section>
                {this.state.tasks.map((task) => {
                    if(task.isRemoved === false){
                        return (
                            <section key={task.id}>
                                <header>{task.name} timer: {this.createTimer(task.time)}</header>
                                <footer>
                                    <button value="isRunning" 
                                        disabled={
                                            task.isDone || (this.interval && !task.isRunning) 
                                                ? true 
                                                : false
                                            } 
                                        onClick={
                                            () => task.isRunning 
                                                ? this.stopHandler(task.id) 
                                                : this.startHandler(task.id)
                                        }
                                    >start/stop</button>
                                    <button value="isDone" disabled={task.isDone} onClick={()=> {
                                        if(task.isRunning){
                                        this.stopHandler(task.id);
                                        this.finishHandler(task.id);
                                    }else{
                                        this.finishHandler(task.id)
                                    }}}>zakończone</button>
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