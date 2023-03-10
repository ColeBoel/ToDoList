
//importing packages
const sqlite3 = require('sqlite3').verbose();
const { response } = require('express');
const express = require('express')
const bodyParser = require('body-parser')
const { uuid } = require('uuidv4');
const app = express();


// open the database
let db = new sqlite3.Database('mydatabase.db');

// create a table
db.run('CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, taskDescription TEXT, createdDate DATE, dueDate DATE, completed BOOLEAN)');
// db.run('DROP TABLE tasks')
//parsing application JSON
app.use(bodyParser.json())


//Getting all tasks from table
function getAllTasks(){
    return new Promise((resolve,reject) => {
        // retrieving all data
        db.all('SELECT * FROM tasks', [], (err, rows) => {
            if (err) {
            reject(err);
            }
            console.log('ROWS:', rows)
            resolve(rows);
        })
    })
}

//Getting filtered tasks from table
function getFilteredTasks(sortBy, completed) {
    let sql = "SELECT * FROM tasks";
    
    if (completed === "1") {
      sql += " WHERE completed = 1";
    } else if (completed === "0") {
      sql += " WHERE completed = 0";
    }
  
    if (sortBy === "createdDate") {
      sql += " ORDER BY createdDate ASC";
    } else if (sortBy === "-createdDate") {
      sql += " ORDER BY createdDate DESC";
    } else if (sortBy === "dueDate") {
      sql += " ORDER BY date(dueDate) ASC";
    } else if (sortBy === "-dueDate") {
      sql += " ORDER BY date(dueDate) DESC";
    }
  
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        console.log('ROWS:', rows)
        resolve(rows);
      });
    });
  }
  

// Get task by ID function
function getTaskById(taskId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

//Posting new task to table
app.post('/tasks', (req, res) => {
    const { postTaskDescription, postTaskDueDate, postTaskCompleted } = req.body;
    console.log('POSTING NEW TASK:', req.body)
    const id = uuid(); // generate unique id using uuid library
    
    const now = new Date();
    const createdDate = formatDate(now);

    // Convert to Date object
    const dateObj = new Date(postTaskDueDate * 1000);

    // Extract year, month, and day
    const year = dateObj.getFullYear() + 31;
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    let day = dateObj.getDate() + 1
    day = ('0' + day).slice(-2);

    // Format as YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;


    console.log(formattedDate);
 
    db.run(`INSERT INTO tasks(id, taskDescription, createdDate, dueDate, completed)
            VALUES (?, ?, ?, ?, ?)`, [id, postTaskDescription, createdDate, formattedDate, postTaskCompleted], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Error creating task' });
        } else {
            res.status(201).send({ id, postTaskDescription, createdDate, formattedDate, postTaskCompleted });
        }
    });
});

//Edit task
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { taskDescription, dueDate, completed } = req.body;
    console.log(taskDescription)
    console.log(dueDate)
    console.log(completed)

    const query = `UPDATE tasks SET taskDescription=?,dueDate=?,completed=? WHERE id=?`

 
    var values = [taskDescription,dueDate,completed,taskId]

    db.run(query, values, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500)    
        }
        res.status(200).json({message: `Task ${taskId} updated! `})
    } )
        
})


// Fetch All Tasks Endpoint
app.get('/tasks', (req, res) => {

    // Get query parameters
    const completed = req.query.completed;
    const sortBy = req.query.sort_by;

    console.log("QUERY:", req.query)

    if (Object.keys(req.query).length === 0){
        getAllTasks().then((rows) => {
            res.status(200).json(rows);
            console.log(rows);
        })
        .catch((err) => {
            console.error(err);
        })
    } else if (sortBy !== undefined || completed !== undefined){
        getFilteredTasks(sortBy, completed).then((rows) => {
            res.status(200).json(rows);
            console.log(rows);
        })
        .catch((err) => {
            console.error(err);
        })
        
    } else {
        res.send(400).json({message: "Error"});
        return
    }

});


//Fetch Specific Tasks Endpoint
app.get('/tasks/:id', (req, res) => {

    const taskId = req.params.id;

    getTaskById(taskId).then((row) => {
        if (row) {
            res.status(200).json(row);
            console.log(row);
        } else {
            res.status(404).json([{message: "Task not found"}])
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json([{message: "Server error"}])
    })
});

//Delete
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
  
    db.run(`DELETE FROM tasks WHERE id = ?`, taskId, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Deleted item ${taskId}`);
      res.sendStatus(200);
    });
  });

  
  function formatDate(date) {
    var month = date.toLocaleString('default', { month: 'long' });
    var day = date.getDate();
    var year = date.getFullYear();
    
    return month + ' ' + day + ', ' + year;
}



// // close the database connection
// db.close();


// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
