const Protected = require('./Protected');

const { express, 'express-basic-auth':basicAuth } = require('@mio/mioscaffold');

const Cors = require('./Cors');

const publicAuth = express.Router();

let app, api, config, logger, thisConfig;
module.exports = class Public extends Protected {
    constructor (_app) {
        super(_app);
        app = _app;
    }
    initPublic(_api, _config, _logger){
        api = _api;
        config = _config;
        logger = _logger;
        thisConfig = config.get('authServer');
        new Cors(publicAuth, thisConfig.get('rest.cors.public.whitelist'), thisConfig.get('rest.cors.public.use') );
        if(thisConfig.get('rest.basicauth.public.use')){
            const basicAuthAdmin = {users: {}};
            basicAuthAdmin.users[thisConfig.get('rest.basicauth.public.username')] = thisConfig.get('rest.basicauth.public.password');
            publicAuth.use(basicAuth(basicAuthAdmin));
        }
        app.use('/auth', publicAuth);
    }
    listenPublic(){        
        publicAuth.get('/ping', (req, res) => {
            res.send('pong');
        })
        publicAuth.post('/login/user', async (req, res) => {
            const { username, password } = req.body;
            api.users.loginUser(username, password)
                .then(token => res.send(token))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                })
        })
        publicAuth.post('/login/token', async (req, res) => {
            const { token } = req.body;
            api.users.loginToken(token)
                .then(freshToken => res.send(freshToken))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                })
        })
        publicAuth.post('/login/mqtt', (req, res) => {
            const { servicename, token, username, ipadress, protocol, sockport } = req.body
            this.keyManager.loginBroker(servicename, token)
                .then(() => res.send(true))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                });
        })
        publicAuth.post('/register/user', (req, res) => {
            const { newUser, origin } = req.body
            api.users.makeUser(newUser, origin)
                .then(user => res.send(user))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                });
        })
        publicAuth.post('/resetpassword', (req, res) => {
            const { password, token } = req.body
            api.users.setPassword(password, token)
                .then(user => res.send(user))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                })
        })
        publicAuth.post('/resetpassword/user', (req, res) => {
            const { username, origin } = req.body
            api.users.passwordReset(username, origin)
                .then(message => res.send(message))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)
                })
        })

        publicAuth.post('/super', async (req, res) => {
            res.status(403).send('access denied');
        })

        publicAuth.get('/acl', async (req, res) => {
            //console.log(req.query);
            res.send();
            //res.status(403).send('access denied');
        })

        logger.log(`Public services listening at ${this.protocol}${thisConfig.get('rest.location')}:${thisConfig.get('rest.port')}/auth`);
        if(thisConfig.get('rest.basicauth.public.use')) logger.prompt(`
BasicAuth username and password for public auth services is defined in "vioapp-scaffold/config/default.json"
Production strategy needs to evolve using "vioapp-scaffold/control/keyStore/${process.env.NODE_ENV}/${this.domain}_public.pem"
see: https://github.com/lorenwest/node-config/wiki/Securing-Production-Config-Files
        `, 'POC security hook point', 'cyan');
    };
}