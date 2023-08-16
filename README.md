# deresy-ui

## Project setup

```
yarn install
```

## Create env files

Create the following files and fill the corresponding values from corresponding firebase project

```
.env.development
.env.staging.local
.env.production.local
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Checks lint issues

```
yarn lint
yarn lint:fix
```

### Compiles and minifies for production

```
yarn build
```

### Run your unit tests

```
yarn test:unit
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### Deploy to firebase hosting

- Login to firebase cli

```
firebase login
```

- If you are already logged in, the firebase cli will return current account, if it is not the correct one, you need to log out first

```
firbase logout
```

- Run the corresponding script according to the environment you want to deploy

```
yarn deploy:dev
yarn deploy:staging
yarn deploy:prod
```

### Uglify a file

Obfuscates and minifies the given JavaScript file. Usage:

#### Current command:

```
./node_modules/.bin/uglifyjs <input file> --compress --output <output file>
./node_modules/.bin/uglifyjs <input file> --compress --mangle "reserved=[Main level words that must not change (Comma separated)]" --mangle-props "reserved=[<Properties that must not change (Comma separated)>]" --output <output file>
```

#### Current command:

IMPORTANT: This list needs to be maintained UP TO DATE when a new function/variable/constant from P5 library is used in the PlayerService.js script.
Note: log is added to the list for debugging purposes (so we can use console.log if needed for dev)

```
./node_modules/.bin/uglifyjs player-service/PlayerService.js --compress --mangle "reserved=['p5','sketch']" --mangle-props "reserved=['mode','style','var1','var2','background','showAddress','iteration','fontUrl','beginShape','bezier','bezierPoint','bezierTangent','blendMode','circle','createCanvas','defineSketch','dist','endShape','fill','lerpColor','loadFont','noLoop','noStroke','pixelDensity','preload','randomSeed','setup','stroke','strokeWeight','text','textAlign','textFont','externalFont','textSize','triangle','vertex','ADD','BLEND','CENTER','DIFFERENCE','TWO_PI','log']" --output src/services/PlayerService.js
```
