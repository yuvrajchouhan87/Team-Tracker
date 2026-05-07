const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admin = await User.findOne({ role: 'SuperAdmin' });
    if (admin) {
        console.log('SuperAdmin found:', admin.email);
    } else {
        console.log('No SuperAdmin found.');
    }
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
