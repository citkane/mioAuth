const Users = require('../internalApi/Users');
const Services = require('../internalApi/Services');
const Permissions = require('../internalApi/Permissions');

let keys, logger;
class InternalApi {
    constructor(_logger, config){
        logger = _logger;
        this.api = {
            users: new Users(config),
            services: new Services(config),
            permissions: new Permissions(config)
        }
        keys = Object.keys(this.api);
    }
    
    init(mio, keyManager){
        if(keyManager) this.api.keyManager = keyManager; //keyManager is only used for AUTH modules
        const promises = [];
        keys.forEach(key => {
            promises.push(this.api[key].init(this.api, mio, logger));
        });
        return Promise.all(promises).then(() => logger.logInternalApiReady())
    }
}

module.exports = InternalApi;