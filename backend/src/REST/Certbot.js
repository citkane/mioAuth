//const express = require('express');
const fs = require('fs-extra');
const { exec, execSync } = require('child_process');
const path = require('path');

let config, logger;
module.exports = class Certbot {
    constructor(){}
    initCertbot(_config, _logger){
        config = _config;
        logger = _logger;
        return new Promise((resolve, reject) => {
            this.location = config.get('authServer.rest.location');
            this.email = config.get('authServer.rest.certs.certbotEmail');
            this.letsFolder = '/etc/letsencrypt';
            if(!fs.existsSync(this.letsFolder)) return reject('Certbot not installed');
            this.privKey = path.join(this.letsFolder, `live/${this.location}/privkey.pem`);
            this.cert = path.join(this.letsFolder, `live/${this.location}/fullchain.pem`);
            if(
                !fs.existsSync(this.privKey) ||
                !fs.existsSync(this.cert)
            ) {
                return this.installCerts()
                    .then(() => {                       
                        execSync(`sudo "chmod" 0755 ${this.letsFolder}/live`);
                        execSync(`sudo "chmod" 0755 ${this.letsFolder}/archive`);
                        const privArchive = path.join(this.letsFolder, 'archive', this.location, 'privkey1.pem');
                        execSync(`sudo "chmod" 0640 ${privArchive}`);
                        execSync(`sudo "chgrp" $USER ${privArchive}`);
                        execSync(`sudo "chmod" 0640 ${this.privKey}`);
                        execSync(`sudo "chgrp" $USER ${this.privKey}`);
                        this.makeRenewHook();
                        resolve(true);                       
                    })
                    .catch(err => reject(err));
            }
            resolve(true);
        })
    }
    installCerts(){
        return new Promise((resolve, reject) => {
            exec(`sudo "certbot" certonly --standalone -d ${this.location} -m ${this.email} --agree-tos -n`, (error, stdout, stderr) => {
                if(error) return reject(error);
                if(stderr) logger.logError(stderr);
                if(stdout) logger.log(stdout);
                resolve(true);
            });
        })
    }
    getCertbotCredentials(){
        return {
            key: fs.readFileSync(this.privKey, 'utf8').toString(),
            cert: fs.readFileSync(this.cert, 'utf8').toString()
        };
    }
    makeRenewHook(){
        const localFile = path.join(__dirname, '../../vioauth.sh');
        const postDeployPath = path.join(this.letsFolder, 'renewal-hooks/deploy/vioauth.sh');
        const command = `
#!/bin/sh
if [ $RENEWED_LINEAGE = "${config.get('authServer.rest.location')}" ]; then
wget https://localhost:${config.get('authServer.rest.port')}/certbot/rotate --no-check-certificate &>/dev/null
fi                       
        `
        execSync(`"echo" '${command}' > ${localFile}`);
        execSync(`"chmod" +x ${localFile}`);
        execSync(`sudo "mv" ${localFile} ${postDeployPath}`);
    }
}