let api, vio, config;
module.exports = class Services {
    constructor(_config) {
        config = _config;
    }
    init(_api, _vio){
        api = _api;
        vio = _vio;
        return Promise.resolve();
    }
    onConnect(){}
    loginService(username, password, serviceName, version, npm){
        let user;
        return api.keyManager.loginUser(username, password)
            .then(_user => user = _user)
            .then(() => api.keyManager.validateServiceAdmin(user, serviceName, version, npm))
            .then(() => api.keyManager.getPublicKeyPem())
    }
    makeChallenge(publicKey, serviceName){
        return api.keyManager.validatePublicKey(publicKey).then(() => api.keyManager.setServiceChallenge(serviceName))
    }
    getToken(challengeResult, serviceName){
        let token;
        return api.keyManager.validateServiceChallenge(challengeResult)
            .then(() => api.keyManager.newServiceToken(serviceName))
            .then(_token => token = _token)
            .then(() => api.keyManager.getServiceUser(serviceName))
            .then(user => ({ token, user }));      
    }
};




