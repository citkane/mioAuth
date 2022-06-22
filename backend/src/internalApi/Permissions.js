let api, mio, config;
module.exports = class Permissions {
    constructor(_config) {
        config = _config;
    }
    init(_api, _mio){
        api = _api;
        mio = _mio;
        return Promise.resolve();
    }
    onConnect(){}
    addPermissions(permissions) {
        console.log(permissions);
    }
};