# koa-aog
Koa middleware to handle Google Assistant action requests.

Supports execution of [Actions On Google](http://npmjs.com/package/actions-on-google) DialogFlow and ActionsSdk fulfillment.


## Installation
Install the koa-aog package from NPM:
```bash
npm install --save koa-aog
```


## Usage
To use the middleware, add it to a Koa server as follows:

```js
const Koa = require('koa');
const KoaBody = require('koa-body');
const KoaActionsOnGoogle = require('koa-aog');
let action = require('./action'); //The Google action implementation

const app = new Koa();

app.use(KoaBody());

app.use(KoaActionsOnGoogle({ action: action }));

app.listen(3000);
```


The `action` must be an instance of an [Actions On Google](http://npmjs.com/package/actions-on-google) fulfillment. For example, a simple `action.js` may look like:
```js
const { dialogflow } = require('actions-on-google');

const app = dialogflow({ debug: true });

app.intent('Call API', async (conv, input) => {
    conv.ask('You need to add action code!');
});
```
