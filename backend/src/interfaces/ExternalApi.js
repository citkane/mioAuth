const ExternalInterface = require('@vio-core/connect/src/vioLang/ExternalInterface');

module.exports =  class ExternalApi extends ExternalInterface  {
    constructor(api) {
        super(['permissions']);

        this.interface.permissions.create = {
            addPermissions: {
                fn: (permissions) => api.permissions.addPermissions(permissions),
                permissions: {
                    roles:['microservice'],
                    groups:[]
                },
                docs:{}
            }
        }
    }
}