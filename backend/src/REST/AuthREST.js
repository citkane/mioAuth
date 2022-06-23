const {
    express,
    'body-parser':bodyParser,
    https,
    'fs-extra':fs
} = require('@mio/mioscaffold');

const KeyManager = require('@mio-lib/miosecurity');
const Logger = require('@mio-lib/miologger');

const Public = require('./Public');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let config, thisConfig, logger, api;
module.exports = class AuthREST extends Public {
    constructor(appDetails) {
        super(app);
        this.domain = appDetails.domain;
        config = appDetails.config.get(this.domain)
        thisConfig = config.get('authServer');
        logger = new Logger({
            uid: 'mioAuth-REST',
            type: 'special',
            config: appDetails.config
        });
        this.keyManager = new KeyManager(logger, this.domain, config);
        this.https = thisConfig.get('rest.https');
        this.protocol = this.https ? 'https://' : 'http://'
    }

    init(_api){
        api = _api;
        this.initPublic(api, config, logger);
        this.initProtected(api, config, logger);
        return this.listen().then(() => this.keyManager.init(api));
    }

    listen(){
        return new Promise(async (resolve, reject) => {
            let authServer = app;
            try {               
                if(this.https) {
                    let credentials;
                    if(thisConfig.get('rest.certs.certbot')) {
                        const certManager = express.Router();
                        app.use('/certbot', certManager);
                        certManager.get('/rotate', (req, res) => {
                            /**
                             * TODO - automatic certbot rotation on renewal is UNTESTED
                             * POC will wait and see...
                             */
                            if(req.hostname !== 'localhost') return res.status(403).send('forbidden');
                            logger.log('rotating Certbot certs');
                            res.send();
                            authServer.close(() => {
                                logger.log('Auth server closed');
                                credentials = this.getCertbotCredentials();
                                authServer = https.createServer(credentials, app);
                                authServer.listen(thisConfig.get('rest.port'), err => {                               
                                    if(err) return logger.logError(err);
                                    logger.log(`Auth Server listening at ${this.protocol}${thisConfig.get('rest.location')}:${thisConfig.get('rest.port')}`);
                                })
                            })                            
                        })
                        await this.initCertbot(config, logger);
                        credentials = this.getCertbotCredentials();
                    } else {
                        credentials = {
                            key: fs.readFileSync(thisConfig.get('rest.certs.privateKey', 'utf8').toString()),
                            cert: fs.readFileSync(thisConfig.get('rest.certs.certificate', 'utf8').toString())
                        }
                    }
                    authServer = https.createServer(credentials, app);
                }
            }
            catch(err){
                reject(err);
            }
            authServer.listen(thisConfig.get('rest.port'), (err) => {
                if(err) return reject(err);
                logger.log(`Auth Server listening at ${this.protocol}${thisConfig.get('rest.location')}:${thisConfig.get('rest.port')}`);
                this.listenPublic();
                this.listenProtected();
                resolve(true);
            });
        })
    }
}