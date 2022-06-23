const ExternalInterface = require('@mio-lib/mioservice/src/etc/ExternalInterface');

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