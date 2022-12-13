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
    constructor(props){
        super(props);
        this.props 
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
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
            console.log(this.interval)
        }
        this.setState(state => {
            const newTasks = state.tasks.map((task) => {
                if(task.id === taskId){
                    if(task.isRunning){
                        return{...task, isDone: true, isRunning: false}
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
    stopHandler = (taskId) => {
        clearInterval(this.interval);
        this.interval = null;
        console.log(this.interval)
        this.setState((state)=> {
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
        if(!this.interval){
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
    }
    render() {
        return (
            <>
                <section className="manager">
                    <h1 className="manager__headline" onClick={ this.onClick }>TasksManager</h1>
                    <form className="form" onSubmit={this.sendTask}>
                        <input className="form__input" required="required" type="text" name="name" value={this.state.task.name} onChange={this.changeHandler} />
                        <label className="form__label"htmlFor="task">Task name</label>
                        <button className="form__button button">Add<input className="button-input" type="submit"/></button>
                    </form>
                </section>
                {this.state.tasks.map((task) => {
                    if(task.isRemoved === false){
                        return (
                            <section className="task"key={task.id}>
                                <header className="task__header">
                                    <h2 className="task__title">{task.name}</h2>
                                    <div className="task__timer">{this.createTimer(task.time)}</div>
                                </header>
                                <footer className="task__footer">
                                    <button className="task__button button" value="isRunning" 
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
                                    <button className="task__button button" value="isDone" disabled={task.isDone } onClick={() => this.finishHandler(task.id)}>end</button>
                                    <button className="task__button button" value="isRemoved" disabled={!task.isDone} onClick={() => this.removeHandler(task.id)}>delete</button>
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