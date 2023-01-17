import { exists, xf, unwrap } from '../functions.js';
import { Url, BodyType, Res, Req,
         TextResponse, JsonResponse,
         Endpoint } from './common.js';
import { models } from './models.js';


function StartRegisterRequest() {
    const type = `{username: String}`;

    function check(data) {
        if(!exists(data.username)) return false;
        if(Object.keys(data).length > 1) return false;
        if(!models.username.isValid(data.username)) return false;
        return true;
    }
    function fallback() { return {username: ''}; }
    function serialize(data) {
        return JSON.stringify(data);
    }

    return Object.freeze({
        type,
        check,
        fallback,
        serialize,
    });
}

function StartRegisterResponse(args = {}) {
    return JsonResponse();
}

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

        const res = await requestChallenge();

        console.log(`publicKeyCredentialCreationOptions: `, res);

        const publicKeyCredentialCreationOptions = {
            challenge: Uint8Array.from(res.publicKey.challenge, c => c.charCodeAt(0)),
            rp: {
                name: res.publicKey.rp.name,
                id: res.publicKey.rp.id,
            },
            user: {
                id: Uint8Array.from(res.publicKey.user.id, c => c.charCodeAt(0)),
                name: res.publicKey.user.name,
                displayName: res.publicKey.user.displayName,
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}],
            authenticatorSelection: {
                authenticatorAttachment: "cross-platform",
            },
            timeout: 60000,
            attestation: "direct"
        };

        const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions,
        });

        console.log(`credential `, credential);
    }

    function onAuthenticate() {
    }

    function requestChallenge() {

        return Endpoint({
            name: "register_start",
            url: `${baseUrl}/api/v1/users/register_start`,
            options: {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            },
            data: { username },
            request: StartRegisterRequest(),
            response: StartRegisterResponse(),
            debug: true,
        }).send();
    }

    return Object.freeze({
        start,
        stop,
    });
}

export { WebAuthN };
