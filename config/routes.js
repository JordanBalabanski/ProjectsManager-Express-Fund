const restrictetPages = require('./auth');
const homeController = require('../controllers/home');
const userController = require('../controllers/user');

module.exports = (app) => {
    app.get('/', homeController.index);
    app.get('/register', restrictetPages.isAnonymous, userController.registerGet);
    app.post('/register', restrictetPages.isAnonymous, userController.registerPost);

    app.get('/login', restrictetPages.isAnonymous, userController.loginGet);
    app.post('/login', restrictetPages.isAnonymous, userController.loginPost);

    app.post('/logout', restrictetPages.isAuthed, userController.logout);

    app.get('/profile', restrictetPages.isAuthed, userController.profile);

    app.post('/leaveTeam', restrictetPages.isAuthed, userController.leaveTeam);

    app.get('/createTeam', restrictetPages.hasRole('Admin'), userController.createTeamGet);
    app.post('/createTeam', restrictetPages.hasRole('Admin'), userController.createTeamPost);

    app.get('/createProject', restrictetPages.hasRole('Admin'), userController.createProjectGet);
    app.post('/createProject', restrictetPages.hasRole('Admin'), userController.createProjectPost);

    app.get('/admin/projects', restrictetPages.hasRole('Admin'), userController.distributeProjectsGet);
    app.post('/admin/projects', restrictetPages.hasRole('Admin'), userController.distributeProjectsPost);

    app.get('/admin/teams', restrictetPages.hasRole('Admin'), userController.distributeTeamsGet);
    app.post('/admin/teams', restrictetPages.hasRole('Admin'), userController.distributeTeamsPost);

    app.get('/user/projects', restrictetPages.isAuthed, userController.projectsGet);
    app.post('/projectsSearch', restrictetPages.isAuthed, userController.projectsSearch);

    app.get('/user/teams', restrictetPages.isAuthed, userController.teamsGet);
    app.post('/teamsSearch', restrictetPages.isAuthed, userController.teamsSearch);

    app.all('*', (req, res) => {
        res.status(404);
        res.send('404 Not Found');
        res.end();
    });
};