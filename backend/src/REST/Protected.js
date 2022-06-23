const Certbot = require('./Certbot');
const { express, 'express-basic-auth':basicAuth } = require('@mio/mioscaffold');

const Cors = require('./Cors');

const protectedAuth = express.Router();

let app, api, config, logger, thisConfig;
module.exports = class Protected extends Certbot {
    constructor (_app) {
        super(_app);
        app = _app;
    }
    initProtected(_api, _config, _logger){
        api = _api;
        config = _config;
        logger = _logger;
        thisConfig = config.get('authServer');
        new Cors(protectedAuth, thisConfig.get('rest.cors.protected.whitelist'), thisConfig.get('rest.cors.protected.use'));
        if(thisConfig.get('rest.basicauth.protected.use')){
            const basicAuthAdmin = {users: {}};
            basicAuthAdmin.users[thisConfig.get('rest.basicauth.protected.username')] = thisConfig.get('rest.basicauth.protected.password');
            protectedAuth.use(basicAuth(basicAuthAdmin));
        }
        app.use('/admin', protectedAuth);
    }
    listenProtected(){
        protectedAuth.get('/ping', (req, res) => {
            res.send('pong');
        })
        protectedAuth.post('/login/service', async (req, res) => {
            const { username, password, serviceName, version, npm } = req.body;
            api.services.loginService(username, password, serviceName, version, npm)
                .then(pem => res.send(pem))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)                    
                })
        })
        protectedAuth.post('/challenge/service', async (req, res) => {
            const { publicKey, serviceName } = req.body;
            api.services.makeChallenge(publicKey, serviceName)
                .then(challenge => res.send(challenge))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)                      
                })
        })
        protectedAuth.post('/token/service', async (req, res) => {
            const { challengeResult, serviceName } = req.body;
            api.services.getToken(challengeResult, serviceName)
                .then(token => res.send(token))
                .catch(err => {
                    if(err.invalid) return res.status(err.invalid.code).send(err.invalid.message);
                    logger.logError(err);
                    res.status(500).send(err.message)                     
                })
        })

        logger.log(`Protected services listening at ${this.protocol}${thisConfig.get('rest.location')}:${thisConfig.get('rest.port')}/admin`)
        if(thisConfig.get('rest.basicauth.protected.use')) logger.prompt(`
BasicAuth username and password for protected auth services is defined in "vioapp-scaffold/config/default.json"
Production strategy needs to evolve using "vioapp-scaffold/control/keyStore/${process.env.NODE_ENV}/${this.domain}_public.pem"
see: https://github.com/lorenwest/node-config/wiki/Securing-Production-Config-Files
        `, 'POC security hook point', 'cyan');
    };
}