let uids = [];
let usersByUsername = {};
let usersByEmail = {};
let api, mio, logger, config, allowedUserDomains;

function sanitize(string){
    /**
     * This will do for POC, but more sophisticated parsing needed for enterprise.
     * Needs to allow for email
     * see https://stackoverflow.com/a/201378
     */
    return string.trim().toLowerCase().replace(/^\@ | ^\- | [^a-z] | [^0-9]/g, '');
}
function sanitizeUser(user){
    user.email = sanitize(user.email);
    user.username = sanitize(user.username);
    user.firstname = sanitize(user.firstname);
    user.lastname = sanitize(user.lastname);
    return user;
}
function indexUsers(users, self){
    uids = Object.keys(users);
    Object.keys(users).forEach(uid => {
        if(uids.indexOf(uid) === -1) delete self.users(uid);
    });
    uids.forEach(uid => {
        self.users[uid] = users[uid];
    })
    uids.forEach(uid => {           
        usersByUsername[users[uid].credentials.username] = self.users[uid];
        usersByEmail[users[uid].credentials.email] = self.users[uid];
    })
}
function getNewUid(){
    const lastUid = uids.length ? uids[uids.length -1] : 0;
    return (lastUid*1) + 1;
}
function isValidEmail(email){
    return !!allowedUserDomains.find(domain => email.endsWith(domain))
}
function isValidPassword(password){
    /**
     * TODO: Password validation rules goes here
     */
    return true;
}
function isUniqueUser(user){
    if(!!usersByUsername[user.username] || !!usersByEmail[user.email]) return false;
    return true;
}

module.exports = class Users {
    constructor(_config) {
        config = _config;
        allowedUserDomains = config.get('authServer.allowedUserDomains')      
    }
    init(_api, _mio, _logger){
        logger = _logger;
        api = _api;
        mio = _mio;
        this.users = {};
        return Promise.resolve();
    }
    onConnect(){}
    sanitizeUser(details){
        return Promise.resolve(sanitizeUser(details))
    }
    isValidPassword(password){
        if(!isValidPassword(password)) return Promise.reject(logger.logInvalid(403, 'Password not strong enough - TODO set rules'))
        return Promise.resolve(true);
    }
    isValidEmail(email){
        if(!isValidEmail(email)) return Promise.reject(logger.logInvalid(403, 'Registration email is not in an allowed domain'));
        return Promise.resolve(true);
    }
    isUniqueUser(user){
        if(!isUniqueUser(user))return Promise.reject(logger.logInvalid(409, 'That email or username is already registered'));
        return Promise.resolve(true);
    }
    getUsers(){
        return api.keyManager.getUsers().then(users => indexUsers(users, this))
    }
    getUserByName(username){
        const user = usersByUsername[username] || usersByEmail[username];
        if(!user) return Promise.reject(logger.logInvalid(403, 'Incorrect credentials'));
        return Promise.resolve(user);
    }
    getUserById(uid){
        const user = this.users[uid];
        if(!user) return Promise.reject(logger.logInvalid(403, 'Incorrect credentials'));
        return Promise.resolve(user);
    }


    loginUser(username, password) {
        let user;
        return api.keyManager.loginUser(username, password)
            .then(_user => {
                user = _user;
                if(user.invalid) throw user;
            })
            .then(() => api.keyManager.newUserToken(user))
    }
    loginToken(token) {
        let user;
        return api.keyManager.validateToken(token)
            .then(_user => {
                user = _user;
                if(user.invalid) throw user;
                return api.users.getUserById(user.credentials.uid)
            })
            .then(freshUser => api.keyManager.newUserToken(freshUser))
    }
    makeUser(newUser, origin) {
        newUser = sanitizeUser(newUser);
        const uid = getNewUid();        
        let user;
        return this.isValidEmail(newUser.email)
            .then(() => this.isUniqueUser(newUser))
            .then(() => api.keyManager.saveNewUser(uid, newUser, 'user'))       
            .then(() => this.getUsers())
            .then(() => this.getUserById(uid))
            .then(_user => user = _user)
            .then(() => api.keyManager.newUserToken(user, config.get('tokenExpiry.newpassword')))
            .then(token => mio.create('mail.users.welcomemessage', [user.credentials, token, origin]))
            .then(() => user)
    }

    setPassword(password, token){
        let user;
        return this.isValidPassword(password)
            .then(() => api.keyManager.validateToken(token))
            .then(_user => user = _user)
            .then(() => api.keyManager.saveUserPass(user.credentials.uid, password))
            .then(() => user);       
    }
    passwordReset(username, origin){
        username = sanitize(username);
        let user;
        return this.getUserByName(username)
            .then(_user => user = _user)
            .then(() => api.keyManager.newUserToken(user, config.get('tokenExpiry.newpassword')))
            .then(token => mio.create('mail.users.resetpassword', [user.credentials, token, origin]))
            .then(() => `A password reset link was sent to your registered email. It is valid for ${config.get('tokenExpiry.newpassword')}.`)
    }
};

