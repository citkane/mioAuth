if(!process.env.NODE_ENV) process.env.NODE_ENV = "development";
const config = require('@mio-core/mioconfig');
const Logger = require('@mio-core/miologger')
const MioService = require('@mio-core/mioservice');
const AuthREST = require('./REST/AuthREST');

const InternalApi = require('./interfaces/InternalApi');
const ExternalApi = require('./interfaces/ExternalApi');

const appDetails = {
    domain: 'mioApp',
    uid: 'miocore-auth',
    type: 'service',
    InternalApi,
    ExternalApi,
    config
}
const logger = new Logger(appDetails);
const authRest = new AuthREST(appDetails);

let connection;
new MioService(appDetails, logger).init(authRest.keyManager)
    .then(conn => connection = conn)
    .then(() => authRest.init(connection.internalApi))
    .then(() => connection.register())
    .then(challenge => connection.runChallenge(challenge))
    .then(result => connection.getServiceToken(result))
    .then(data => connection.connectMqtt(data))
    .catch(err => {
        logger.logError(err);      
        process.abort();
    })
