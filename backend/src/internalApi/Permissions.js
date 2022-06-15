let api, vio, config;
module.exports = class Permissions {
    constructor(_config) {
        config = _config;
    }
    init(_api, _vio){
        api = _api;
        vio = _vio;
        return Promise.resolve();
    }
    onConnect(){}
    addPermissions(permissions) {
        console.log(permissions);
    }
};