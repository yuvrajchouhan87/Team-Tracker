const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/remote-team-tracker', {
}).then(async () => {
    const users = await User.find({});
    fs.writeFileSync('users_output.json', JSON.stringify(users.map(u => ({ email: u.email, role: u.role, status: u.status })), null, 2));
    process.exit(0);
}).catch(console.error);
