const mongoose = require('mongoose');
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    roles: [{
        type: mongoose.Schema.Types.String
    }],
    salt: {
        type: String,
        required: true
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    }],
    profilePicture: {
        type: mongoose.Schema.Types.String,
        default: 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png'
    },
});


userSchema.method({
    authenticate: function (password) {
        let inputPasswordHash = encryption.hashPassword(password, this.salt);
        let isSamePasswordHash = inputPasswordHash === this.passwordHash;
        return isSamePasswordHash;
    },

    isInRole: function (role) {
        return this.roles.indexOf(role) !== -1;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

User.seedAdmin = async () => {
    try {
        let users = await User.find();
        if (users.length > 0) return;
        const salt = encryption.generateSalt();
        const passwordHash = encryption.hashPassword('123', salt);
        return User.create({
            salt,
            username: 'admin',
            passwordHash,
            firstName: 'Kiril',
            lastName: 'Kirilov',
            roles: ['Admin']
        });
    } catch (e) {
        console.log(e);
    }
};