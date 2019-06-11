module.exports = {
    isAuthed: (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect('/login');
        }
    },
    hasRole: (role) => (req, res, next) => {
        if (req.user &&
            req.user.roles.indexOf(role) > -1) {
            next();
        } else {
            res.redirect('/login');
        }
    },
    isAnonymous: (req, res, next) => {
        if (!req.user) {
            next();
        } else {
            res.redirect('/');
        }
    },
    // isModerator:  (req, res, next) => {
    //     if (req.user
    //         && (req.user.articles.some(x => x.toString() === req.params.id.toString())
    //             || req.user.roles.includes('Admin'))) {
    //         next();
    //     } else {
    //         res.redirect('/');
    //     }
    // },
}