const assert = require('chai').assert;
const rewire = require('rewire');
const middleware = rewire('../index.js');
const aog = require('actions-on-google');


describe('Tests for /index.js', () => {
    /* Set up test: create a mock action */
    let action;
    const BaseMockAction = function(...args) {
        if (arguments[0]!=undefined && arguments[0].request.body.inputs.intent==='OK') {
            arguments[0].response.status = 200;
            arguments[0].response.body = 'SUCCESS';
        } else if (arguments[0]!=undefined && arguments[0].request.body.inputs.intent==='ERROR') {
            throw new Error('Test action error');
        }
    }
    BaseMockAction.frameworks = {};
    BaseMockAction.handler = () => { }
    BaseMockAction.intent = () => { }

    /* Test initialisation */
    describe('Test initialisation', () => {
        beforeEach(() => {
            action = BaseMockAction;
        })
        it('Initialisation with valid options should return a function', async () => {
            let result = middleware({ action: action });
            assert.isDefined(result, 'Should return a defined value');
            assert.isFunction(result, 'Should return a function');
            assert.isDefined(action.frameworks.koa, 'Koa framework should be defined on the action');
        });
        it('Initialisation with invalid action', async () => {
            function initWithInvalidAction() {
                middleware({ action: {} });
            }
            assert.throws(initWithInvalidAction, TypeError, /not a Google ActionSdk or DialogFlow app/, 'Should throw a TypeError');
        });
        it('Initialisation with undefined action', async () => {
            function initWithUndefinedAction() {
                middleware({ });
            }
            assert.throws(initWithUndefinedAction, TypeError, /not a Google ActionSdk or DialogFlow app/, 'Should throw a TypeError');
        });
    });

    /* Test handling */
    describe('Test request handling', () => {
        beforeEach(() => {
            action = BaseMockAction;
        })
        it('Request does not accept JSON', async () => {
            let handler = middleware({ action: action });
            let ctx = {
                accepts: (...args) => { return false; },
                assert: require('http-assert')
            };
            let results = undefined;
            try {
                results = await handler(ctx);
            } catch (err) {
                assert.equal(err.status, 406, 'Request should throw a 406');
            }
            assert.isUndefined(results, 'Request should throw an error');
        });
        it('Request is not a POST', async () => {
            let handler = middleware({ action: action });
            let ctx = {
                accepts: (...args) => { return true; },
                assert: require('http-assert'),
                method: 'GET'
            };
            let results = undefined;
            try {
                results = await handler(ctx);
            } catch (err) {
                assert.equal(err.status, 405, 'Request should throw a 405');
            }
            assert.isUndefined(results, 'Request should throw an error');
        });
        it('Request is a valid intent request', async () => {
            let handler = middleware({ action: action });
            let ctx = {
                accepts: (...args) => {
                    return true;
                },
                method: 'POST',
                assert: require('http-assert'),
                request: { body: { inputs: { intent: 'OK' }} },
                response: {}
            };
            try {
                let results = await handler(ctx);
            } catch (err) {
                assert.isUndefined(err, `Handler should not throw a ${err.name||'error'}`);
            }
            assert.isDefined(ctx.response, 'A valid response should be set in the context');
            assert.deepEqual(ctx.response.status, 200, 'Response status HTTP_OK');
            assert.isDefined(ctx.response.body, 'Response body should be a defined value');
            assert.deepEqual(ctx.response.body, 'SUCCESS', 'Response body note expected value');
        });
        it('Request is a valid intent request but throws an error', async () => {
            let handler = middleware({ action: action });
            let ctx = {
                accepts: (...args) => {
                    return true;
                },
                method: 'POST',
                assert: require('http-assert'),
                request: { body: { inputs: { intent: 'ERROR' }} },
                response: {}
            };
            try {
                let results = await handler(ctx);
            } catch (err) {
                assert.isUndefined(err, `Handler should not throw a ${err.name||'error'}`);
            }
            assert.isDefined(ctx.response, 'A valid response should be set in the context');
            assert.deepEqual(ctx.response.status, 500, 'Response status HTTP_INTERNAL_SERVER_ERROR');
            assert.deepEqual(ctx.response.type, 'text/json', 'Response type should be JSON');
            assert.isDefined(ctx.response.body, 'Response body should be a defined value');
            assert.equal(ctx.response.body, 'Test action error', 'Response body should contain a defined error message value');
        });
    });
});
