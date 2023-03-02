const express = require('express')
const app = express();

// Placeholder tasks data
let tasks = [
    {
        id: "1",
        taskDescription: "Grocery Shopping",
        createdDate: new Date(2022, 9, 1),
        dueDate: new Date(2022, 9, 15),
        completed: false
    },
    {
        id: "2",
        taskDescription: "Clean House",
        createdDate: new Date(2022, 9, 5),
        dueDate: new Date(2022, 9, 30),
        completed: true
    },
    {
        id: "3",
        taskDescription: "Blog Post",
        createdDate: new Date(2022, 9, 10),
        dueDate: new Date(2022, 9, 25),
        completed: false
    },
    {
        id: "4",
        taskDescription: "Organize Files",
        createdDate: new Date(2022, 9, 5),
        dueDate: new Date(2022, 9, 30),
        completed: true
    },
    {
        id: "5",
        taskDescription: "Write Offer",
        createdDate: new Date(2022, 9, 5),
        dueDate: new Date(2022, 9, 30),
        completed: true
    },
    {
        id: "6",
        taskDescription: "Send Email",
        createdDate: new Date(2022, 9, 5),
        dueDate: new Date(2022, 9, 30),
        completed: true
    },
    {
        id: "7",
        taskDescription: "Meal Prep",
        createdDate: new Date(2022, 9, 5),
        dueDate: new Date(2022, 9, 30),
        completed: true
    }
];

// Fetch All Tasks Endpoint
app.get('/tasks', (req, res) => {
    // Get query parameters
    const completed = req.query.completed === 'true';
    const sortBy = req.query.sort_by;

    // Filter tasks by completed status
    let filteredTasks = tasks.filter(task => task.completed === completed);

    // Sort tasks by due date or created date if query parameter is present
    if (sortBy) {
        if (sortBy === '+dueDate') {
            filteredTasks.sort((a, b) => a.dueDate - b.dueDate);
        } else if (sortBy === '-dueDate') {
            filteredTasks.sort((a, b) => b.dueDate - a.dueDate);
        } else if (sortBy === '+createdDate') {
            filteredTasks.sort((a, b) => a.createdDate - b.createdDate);
        } else if (sortBy === '-createdDate') {
            filteredTasks.sort((a, b) => b.createdDate - a.createdDate);
        }
    }
    const model = {
        tasks: filteredTasks
    };
    // Send response
    res.status(200).json(model);
});


//Fetch Specific Tasks Endpoint
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const task = tasks.find((t) => t.id === id);
  
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
  
    return res.status(200).json(task);
  });
  

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});


