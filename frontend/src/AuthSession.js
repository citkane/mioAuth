import axios from 'axios';
import cookie from 'js-cookie';
import jwtDecode from 'jwt-decode';
import mqtt from 'mqtt';

const origin = location.origin;


let logger, auth;
export default class AuthSession {
    constructor(_logger, authlocation){
        logger = _logger;
        auth = axios.create({
            baseURL: authlocation,
            timeout: 2000
        });
    }
    register(newUser){
        return auth.post('/register/user', { newUser, origin })
            .then(res => res.data)
            .catch(err => logger.logInvalid(err.response.status, err.response.data))
    }
    setPassword(password, token){
        return auth.post('/resetpassword', { password, token })
            .then(res => res.data)
            .catch(err => logger.logInvalid(err.response.status, err.response.data))
    }
    getAuth(token){
        return auth.post('/login/token', { token })
            .then(res => {
                const token = res.data;
                cookie.set('authToken', token);
                this.user = jwtDecode(token);
                return token;
            })
            .then(token => this.connectMqtt(token))
            .catch(err => {
                logger.logError(err);
                this.logOut();
            });
    }
    requestPasswordReset(username){
        return auth.post('/resetpassword/user', { username, origin })
            .then(res => res.data)
            .catch(err => logger.logInvalid(err.response.status, err.response.data))
    }

    logIn(credentials, fromPasswordReset){
        return auth.post('/login/user', credentials)
            .then(res => {
                const token = res.data;
                cookie.set('authToken', token);
                if(fromPasswordReset) return location.replace('/');
                this.user = jwtDecode(token);
                return token;
            })
            .then(token => this.connectMqtt(token))
            .catch(err => logger.logInvalid(err.response.status, err.response.data));
    }
    logOut(){
        cookie.remove('authToken');
        location.replace('/');
    }
    connectMqtt(token){
        const client = mqtt.connect(mqttLocation, {
            username: this.user.credentials.username,
            clientId: `frontend.${this.user.credentials.uid}.${Date.now()}`,
            password: token,
            protocolVersion: 5

        });
        client.on('connect', () => {            
            this.initApp(client);
            logger.log('mqtt connected');
        })
        client.on('error', err => {
            logger.logError(err);
        })
    }
}