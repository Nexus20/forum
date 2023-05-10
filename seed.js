const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcrypt');

async function seed() {
    const roles = ['Admin', 'Moderator', 'User'];

    for(const roleName of roles) {

        const existingRole = await Role.findOne({ name: roleName });

        if (!existingRole) {
            const newRole = new Role({ name: roleName });
            await newRole.save();
        }
    }

    // Создаем аккаунт администратора, если он еще не существует
    const adminRole = await Role.findOne({ name: 'Admin' });
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (!existingAdmin) {
        const admin = new User({
            username: 'admin',
            password: await bcrypt.hash('GQt5RnHQgMr9UWG', 10),
            email: 'admin@example.com',
            role: adminRole._id
        });

        await admin.save();
    }
}

module.exports = seed;