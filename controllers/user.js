const User = require('mongoose').model('User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost: (req, res) => {
        let registerArgs = req.body;

        registerArgs.profilePicture = registerArgs.profilePicture || 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png';

        User.findOne({
            username: registerArgs.username
        }).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    username: registerArgs.username,
                    passwordHash: passwordHash,
                    firstName: registerArgs.firstName,
                    lastName: registerArgs.lastName,
                    profilePicture: registerArgs.profilePicture,
                    salt: salt,
                    roles: ['User']
                };

                User.create(userObject).then(user => {
                    req.logIn(user, (err) => {
                        if (err) {
                            registerArgs.error = err.message;
                            res.render('user/register', registerArgs);
                            return;
                        }
                        res.redirect('/');
                    })
                });
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({
            username: loginArgs.username
        }).then(user => {
            if (!user || !user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.login(user, (err) => {
                if (err) {
                    res.render('/user/login', {
                        error: err.message
                    });
                    return;
                }

                let returnUrl = '/';
                if (req.session.returnUrl) {
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }
                res.redirect(returnUrl);
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },

    createTeamGet: (req, res) => {
        res.render('admin/create-team');
    },

    createTeamPost: (req, res) => {
        let name = req.body.name;

        Team.create({
                name
            })
            .then(() => {
                res.redirect('/');
            })
            .catch((err) => {
                console.log(err);
                res.locals.error = 'Pleace fill the information correctly!';
                res.render('admin/create-team')
            })
    },

    createProjectGet: (req, res) => {
        res.render('admin/create-project');
    },

    createProjectPost: (req, res) => {
        let {
            name,
            description
        } = req.body;

        Project.create({
                name,
                description
            })
            .then(() => {
                res.redirect('/');
            })
            .catch((err) => {
                console.log(err);
                res.locals.error = 'Pleace fill the information correctly!';
                res.render('admin/create-project')
            })
    },

    distributeProjectsGet: async (req, res) => {
        try {
            let teams = await Team.find();

            let projects = await Project.find().where('team').equals(null);

            res.render('admin/projects', {
                teams,
                projects
            });
        } catch (error) {
            console.log(err);
        }
    },

    distributeProjectsPost: async (req, res) => {
        try {
            const teamId = req.body.team;
            const projectId = req.body.project;

            let team = await Team.findById(teamId);
            let project = await Project.findById(projectId);

            team.projects.unshift(projectId);
            await team.save();
            project.team = teamId;
            await project.save();

            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    },

    distributeTeamsGet: async (req, res) => {
        try {
            let users = await User.find();

            let teams = await Team.find();

            res.render('admin/teams', {
                users,
                teams
            });
        } catch (error) {
            console.log(err);
        }
    },

    distributeTeamsPost: async (req, res) => {
        try {
            const userId = req.body.user;
            const teamId = req.body.team;

            let user = await User.findById(userId);
            let team = await Team.findById(teamId);

            if (user.teams.indexOf(teamId) !== -1) {
                res.locals.error = 'The user is already in the team!'
                let users = await User.find();

                let teams = await Team.find();

                res.render('admin/teams', {
                    users,
                    teams
                });
                return;
            }

            user.teams.unshift(teamId);
            await user.save();
            team.members.unshift(userId);
            await team.save();

            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    },

    projectsGet: async (req, res) => {
        try {
            let projects = await Project.find().populate('team');

            res.render('user/projects', {
                projects
            });
        } catch (error) {
            console.log(error);
        }
    },

    projectsSearch: async (req, res) => {
        try {
            let {
                project
            } = req.body;

            let projects = await Project.find().populate('team');
            projects = projects.filter(p => p.name.toLowerCase().includes(project.toLowerCase()));

            res.render('user/projects', {
                projects
            });
        } catch (error) {
            console.log(error);
        }
    },

    teamsGet: async (req, res) => {
        try {
            let teams = await Team.find().populate('members').populate('projects');

            res.render('user/teams', {
                teams
            });
        } catch (error) {
            console.log(error);
        }
    },

    teamsSearch: async (req, res) => {
        try {
            let {
                team
            } = req.body;

            let teams = await Team.find().populate('members').populate('projects');
            teams = teams.filter(t => t.name.toLowerCase().includes(team.toLowerCase()));

            res.render('user/teams', {
                teams
            });
        } catch (error) {
            console.log(error);
        }
    },

    profile: async (req, res) => {
        try {
            let teams = await Team.find({
                members: {
                    $all: [req.user._id]
                }
            }).populate('projects');

            res.render('user/profile', {
                teams
            });
        } catch (error) {
            console.log(error);
        }
    },

    leaveTeam: async (req, res) => {
        try {
            let {
                teamId
            } = req.body;
            let user = req.user;

            let team = await Team.findById(teamId);
            team.members = team.members.filter(m => m.toString() !== req.user.id);
            await team.save();
            user.teams = user.teams.filter(t => t.toString() !== teamId.toString());
            await user.save();

            res.redirect('/profile');
        } catch (error) {
            console.log(error);
        }
    }
};