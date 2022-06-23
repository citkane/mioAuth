const { cors } = require('@mio/mioscaffold');

module.exports = class Cors {
    constructor(route, whitelist, use){
        const corsOptions = {
            origin: function (origin, callback) {
                if(!use) return callback(null, true);
                if(origin === undefined) return callback('Not allowed by CORS');
                origin = origin.split(':');
                origin.pop();
                origin = origin.join(':');
                if (whitelist.indexOf(origin) !== -1) return callback(null, true);
                callback('Not allowed by CORS');
            }
        }
        route.use(cors(corsOptions));
    }
}