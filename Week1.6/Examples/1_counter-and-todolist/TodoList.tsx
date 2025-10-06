import React, { useState } from "react";

const TodoList: React.FC<{}> = () => {
    const [tasks, setTasks] = useState(["task 1", "task 2"]);
    const [taskInput, setTaskInput] = useState("");

    return (
        <div>
            <h1>Todo list</h1>
            <ul>
                {
                    tasks.map(
                        item => <li>{item}</li> 
                    )
                }
            </ul>
            <input type="text" value={taskInput} onChange={(event) => setTaskInput(event.target.value)}/>
            <input type="button" value="submit" onClick={() => {
                if (taskInput.trim().length > 0) {
                    setTasks([...tasks, taskInput])
                    setTaskInput("");
                }
            }}/>
            <input type="button" value="remove" onClick={() => {
                setTasks(tasks.slice(0, -1))
            }}/>
        </div>
    )
}

export default TodoList;