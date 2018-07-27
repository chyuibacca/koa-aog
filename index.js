/*
 * Koa middleware to handle requests to a configured Google Assistant action.
 */
const debug = require('debug')('koa:aog');
const aog = require('actions-on-google');
const KoaFramework = require('./koa-framework');

/**
 * Generates a Koa middleware handler function to process an Google Assistant action request.
 * @param {Object} options Options to be applied to the request handler
 * @param {Object} options.action Google action implementation (instance of a actions-on-google.DialogFlowApp or actions-on-google.ActionSdkApp)
 * @returns {Function} A Koa middleware function to handle the Google action request
 * @throws {TypeError} If the specified options are invalid
 * @throws {Error} If the request fails to be successfully processed
 */
function generateRequestHandler(options={}) {
    /* Validate the options */
    let action = options.action;
    if (action==undefined ||
        !(typeof action === 'function' && typeof action.handler === 'function' && typeof action.intent === 'function'
          || typeof action.frameworks === 'object')) {
        throw new TypeError(`Option action is not a Google ActionSdk or DialogFlow app`);
    }
    action.frameworks.koa = new KoaFramework();

    /* Return the middleware function to handle the Google action request */
    return async function handleRequest(ctx, next) {
        //Validate the client request
        ctx.assert(ctx.accepts('json'), 406);
        ctx.assert(ctx.method==='POST', 405);
        try {
            await action(ctx, next);
        } catch (err) {
            debug(`${err.name||'Error'} calling the Google action: ${err.message || JSON.stringify(err)}`);
            ctx.response.status = 500; ctx.response.type = 'text/json'
            ctx.response.body = err.message;
        }
    }
}


module.exports = generateRequestHandler;
