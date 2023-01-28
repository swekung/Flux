import { equals, exists, xf, unwrap } from '../functions.js';
import { Url, BodyType, Res, Req,
         TextResponse, JsonResponse,
         Endpoint,
         } from './common.js';
import { models } from './models.js';
import { base64 } from './base64.js';

function WebAuthN(args = {}) {
    const baseUrl = unwrap(args.baseUrl);

    let abortController;
    let username = '';

    function start() {
        abortController = new AbortController();
        const signal = { signal: abortController.signal };

        xf.sub(`db:usernameInput`, onUsernameInput, signal);
        xf.sub(`ui:auth:register`, onRegister, signal);
        xf.sub(`ui:auth:logout`, onLogout, signal);
        xf.sub(`ui:auth:authenticate`, onAuthenticate, signal);
        xf.sub(`ui:auth:is-authenticated`, onIsAuthenticated, signal);

        // xf.dispatch(`auth:register:success`);
        // xf.dispatch(`auth:register:fail`);
        // xf.dispatch(`auth:authenticate:success`);
        // xf.dispatch(`auth:authenticate:fail`);
    }

    function stop() {
        abortController.abort();
    }

    function onUsernameInput(x) {
        username = x;
    }

    function onIsAuthenticated() {
        isAuthenticated();
    }

    async function isAuthenticated() {
        // const assertion = await navigator.credentials.get({});
    }

    async function onRegister() {
        register(username);
    }

    async function register(username) {
        console.log('Registration ...');
        try {
            const registerStartResponse =
                  await fetch(`${baseUrl}/api/v1/users/register_start`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username }),
            });

            const cco = await registerStartResponse.json();

            // console.log(`typeof challenge: ${typeof cco.publicKey.challenge}`);
            // console.log(cco.publicKey.challenge);

            cco.publicKey.challenge = base64.stringToArray(cco.publicKey.challenge);
            cco.publicKey.user.id   = base64.stringToArray(cco.publicKey.user.id);


            // console.log(`challenge encoded to array: `);
            // console.log(cco.publicKey.challenge);

            const credential = await navigator.credentials.create({
                publicKey: cco.publicKey,
            });

            const attestationObject = base64.arrayToString(
                credential.response.attestationObject
            );

            const clientDataJSON = base64.arrayToString(
                credential.response.clientDataJSON
            );

            // console.log(`clientDataJSON raw:`);
            // console.log(credential.response.clientDataJSON);
            // console.log(`clientDataJSON utf-8 decoded:`);
            // console.log(base64.utf8Decoder(credential.response.clientDataJSON));
            // console.log(`clientDataJSON string base64 decoded:`);
            // console.log(base64.decode(clientDataJSON));

            const credentialSerialized = {
                id: credential.id,
                rawId: credential.id,
                type: credential.type,
                response: {attestationObject, clientDataJSON},
            };

            const registerFinishtResponse =
                  await fetch(`${baseUrl}/api/v1/users/register_finish`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentialSerialized),
            });

            if(registerFinishtResponse.ok) {
                console.log('Registration Successful!');
                xf.dispatch(`auth:register:success`);
            } else {
                console.error('Server Error Registering!');
                xf.dispatch(`auth:register:fail`);
            }
            console.log('Registered!');
        } catch(e) {
            console.log(`Error Registring: `, e);
            xf.dispatch(`auth:register:fail`);
        }
    }

    function onAuthenticate() {
        authenticate(username);
    }

    async function authenticate(username) {
        try {
            console.log('authentication ...');
            const authenticateStartResponse =
                  await fetch(`${baseUrl}/api/v1/users/authenticate_start`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username }),
            });

            const cro = await authenticateStartResponse.json();
            cro.publicKey.challenge = base64.stringToArray(cro.publicKey.challenge);
            cro.publicKey.allowCredentials.forEach(credential => {
                credential.id = base64.stringToArray(credential.id);
            });

            const assertion = await navigator.credentials.get({
                publicKey: cro.publicKey
            });

            const authenticateFinishResponse =
                  await fetch(`${baseUrl}/api/v1/users/authenticate_finish`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: assertion.id,
                    rawId: assertion.id, // base64.arrayToString(assertion.rawId),
                    type: assertion.type,
                    response: {
                        authenticatorData: base64.arrayToString(
                            assertion.response.authenticatorData,
                        ),
                        clientDataJSON: base64.arrayToString(
                            assertion.response.clientDataJSON,
                        ),
                        signature: base64.arrayToString(
                            assertion.response.signature,
                        ),
                        userHandle: base64.arrayToString(
                            assertion.response.userHandle,
                        ),
                    },
                }),
            });

            if(authenticateStartResponse.ok) {
                console.log('Logged In!');
                xf.dispatch(`auth:authenticate:success`);
            } else {
                console.log('Server Error when Authenticating!');
                xf.dispatch(`auth:authenticate:fail`);
            }
        } catch(e) {
            console.error(`Error login: `, e);
            xf.dispatch(`auth:authenticate:fail`);
        }

        return 0;
    }

    function onLogout() {
    }

    return Object.freeze({
        start,
        stop,
    });
}

export { WebAuthN };

