const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const USERS_FILE = './users.json';

// Load users from JSON file
const loadUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE));
};

// Save users to JSON file
const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    let users = loadUsers();
    
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    saveUsers(users);
    res.json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let users = loadUsers();
    
    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

app.listen(5000, () => console.log('Server running on port 5000'));
