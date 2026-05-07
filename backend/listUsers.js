const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}, Status: ${u.status}`));
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
