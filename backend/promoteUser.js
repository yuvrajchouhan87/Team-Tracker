const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await User.findOne({ email: 'testuser@example.com' });
    if (user) {
        user.role = 'SuperAdmin';
        user.status = 'Approved';
        await user.save();
        console.log('User testuser@example.com promoted to SuperAdmin and Approved.');
    } else {
        console.log('User testuser@example.com not found.');
    }
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
