require('dotenv').config();
const User = require('./models/User');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

/*
Middleware
Allows Express to read JSON from requests
*/
app.use(express.json());

/*
GET endpoint
*/
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Employee Directory</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }

                header {
                    background: #1f2937;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }

                .container {
                    max-width: 900px;
                    margin: 40px auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                h1 {
                    margin-top: 0;
                }

                .card {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                    background: #fafafa;
                }

                input {
                    padding: 10px;
                    margin: 5px;
                    width: 220px;
                }

                button {
                    padding: 10px 16px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }

                button:hover {
                    background: #1d4ed8;
                }

                .user {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Employee Directory App</h1>
                <p>Node.js + Express + MongoDB</p>
            </header>

            <div class="container">
                <h2>Add Employee</h2>

                <input id="name" placeholder="Employee name">
                <input id="role" placeholder="Job role">
                <button onclick="addUser()">Add Employee</button>

                <div class="card">
                    <h2>Employees</h2>
                    <div id="users">Loading...</div>
                </div>
            </div>

            <script>
                async function loadUsers() {
                    const response = await fetch('/api/users');
                    const users = await response.json();

                    const usersDiv = document.getElementById('users');

                    if (users.length === 0) {
                        usersDiv.innerHTML = '<p>No employees found.</p>';
                        return;
                    }

                    usersDiv.innerHTML = users.map(user => \`
                        <div class="user">
                            <strong>\${user.name}</strong><br>
                            <span>\${user.role}</span>
                        </div>
                    \`).join('');
                }

                async function addUser() {
                    const name = document.getElementById('name').value;
                    const role = document.getElementById('role').value;

                    await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, role })
                    });

                    document.getElementById('name').value = '';
                    document.getElementById('role').value = '';

                    loadUsers();
                }

                loadUsers();
            </script>
        </body>
        </html>
    `);
});

/*
Health check endpoint
*/
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

/*
Users endpoint
*/
app.post('/api/users', async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            role: req.body.role
        });

        res.status(201).json({
            message: 'User saved to MongoDB',
            user: user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error saving user',
            error: error.message
        });
    }
});

/*
POST endpoint
*/
app.post('/api/users', (req, res) => {

    console.log(req.body);

    res.json({
        message: 'User created successfully',
        receivedData: req.body
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
});
