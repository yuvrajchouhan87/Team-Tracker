const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/remote-team-tracker', {
}).then(async () => {
    const result = await User.updateMany(
        { role: 'superadmin' }, 
        { $set: { role: 'SuperAdmin' } }
    );
    console.log('Update result:', result);
    process.exit(0);
}).catch(console.error);
