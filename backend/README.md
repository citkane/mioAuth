# Microservice Module Template #
- [Name your module](./src/module.html)
- [Creating your modules internal API](./src/interfaces/InternalApi.html)
- [Creating a vioLang interface to your module](./src/interfaces/ExternalApi.html)

## Quickstart
To create a new vioApp microservice module, ensure that you have:
- scaffolded a vioApp development environment: [How To](../../README.html)
- that vioApp BFF is running

### [1] Copy and install a new module from template
```bash
cd <your vioapp-scaffold dir>

#If module folder does not exist yet
mkdir ./modules/viomodule-<yourmodulename>
#end if

cp -r ./templates/backend ./modules/viomodule-<yourmodulename>
git checkout <your working branch>

cd ./modules/viomodule-<yourmodulename>

#If git has not yet been initialised
git init
git add .
git commit -m "initial commit"
git checkout -b <your new working branch>
#end if

cd ./backend
nvm use
npm install
```
### [2] Give your module a name
[How to name your module](./src/module.html)

### [3] Start your module
```
npm run start
```
Your new microservice will be auto-discovered, and will auto-connect to all other running vioApp microservices.

et voila
