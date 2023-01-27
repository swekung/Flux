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
        xf.sub(`ui:auth:authenticate`, onAuthenticate, signal);
    }

    function stop() {
        abortController.abort();
    }

    function onUsernameInput(x) {
        username = x;
    }

    async function onRegister() {
        register(username);
    }

    async function register(username) {
        const response = await fetch(`${baseUrl}/api/v1/users/register_start`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username }),
        });

        const cco = await response.json();

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

        const res = await fetch(`${baseUrl}/api/v1/users/register_finish`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentialSerialized),
        });
    }

    function onAuthenticate() {
    }

    async function authenticate() {
        const response = await fetch(`${baseUrl}/api/v1/users/authenticate_start`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify({ username }),
        });
    }

    return Object.freeze({
        start,
        stop,
    });
}

export { WebAuthN };

