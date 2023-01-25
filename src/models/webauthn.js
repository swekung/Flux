import { equals, exists, xf, unwrap } from '../functions.js';
import { Url, BodyType, Res, Req,
         TextResponse, JsonResponse,
         Endpoint,
         base64url, } from './common.js';
import { models } from './models.js';

// Types
// register start response
const PubKeyCredType = {
    publicKey: 'public-key',
};

const PubKeyCredAlg = {
    '-7': -7,
    '-257': '-257',
};

const UserVerification = {
    preferred: 'perferred',
};

const Attestation = {
    none: 'none',
};
// end register start response
// end Types


// String -> Base64Url
function stringToBase64Url(str) {
    return window.btoa(encodeURIComponent(str));
}

// Base64Url String -> String
function base64UrlToString(str) {
    return encodeURIComponent(window.btoa(str));
}

// ArrayBuffer -> String
function bufferToString(arrayBuffer) {
    const utf8Decoder = new TextDecoder('utf-8');
    return utf8Decoder.decode(arrayBuffer);
}

// String -> ArrayBuffer
function stringToBuffer(str) {
    const utf8Encoder = new TextEncoder('utf-8');
    return utf8Encoder.encode(str);
}



function RegisterStartRequest() {
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

    return Req({
        type,
        check,
        fallback,
        serialize,
    });
}

function RegisterStartResponse(args = {}) {
    const type = `{
        publicKey: {
            rp: { name: String, id: String },
            challenge: String,
            user: {
                id: String,
                name: String,
                displayName: String,
            },
            pubKeyCredParams: [
                {type: String, alg: Sint}, {type: String, alg: Sint}
            ],
            extensions: {
                credProps: Bool,
                uvm: Bool,
            },
            authenticatorSelection: {
                requireResidentKey: true,
                userVerification: String,
            },
            attestation: String,
            timeout: Int,
        }
    }`;
    const bodyType = BodyType.Json;

    function fallback() { return {}; }
    function deserialize(data) {
        console.log(data.publicKey.challenge);
        data.publicKey.challenge = base64url.toUint8Array(data.publicKey.challenge);
        data.publicKey.user.id = base64url.toUint8Array(data.publicKey.user.id);
        return data;
    }

    return Res({
        type,
        bodyType,
        fallback,
        deserialize,
    });
}

function RegisterFinishRequest(args = {}) {
    const type = `{
        id: String,
        rawId: Base64URLString,
        type: String,
        authenticatorAttachment: String,
        response: {
            attestationObject: Base64URLString,
            clientDataJSON: Base64URLString,
        }
        extenstions: ClientExtensionResults,
    }`;

    function serialize(data) {
        console.log(`-----------------------------`);
        console.log(`data: `, data);

        const encoded = {
            id: data.id,
            rawId: base64url.fromUint8Array(data.rawId),
            response: {
                attestationObject: base64url.fromUint8Array(
                    data.response.attestationObject),
                clientDataJSON: base64url.fromUint8Array(
                    data.response.clientDataJSON),
                },
            type: data.type,
            authenticatorAttachment: data.authenticatorAttachment,
            extensions: data.getClientExtensionResults(),
        };
        console.log(`encoded: `, encoded);
        const str = JSON.stringify(encoded);
        console.log(`-----------------------------`);
        return str;
    }

    return Req({
        type,
        serialize,
    });
}

function RegisterFinishResponse(args = {}) {

    function deserialize(data) {
        return data;
    }

    return Res({
        bodyType: BodyType.Json,
        deserialize,
    });
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

        const { publicKey } = await registerStart(username);

        console.log(`----------------`);
        console.log(`registerStart(): `, publicKey);
        console.log(`challenge 1: `, publicKey.challenge);

        const credential = await navigator.credentials.create({publicKey});

        console.log(`credentials.create(): `, credential);

        var clientDataJson = JSON.parse(bufferToString(credential.response.clientDataJSON));
        console.log(`challenge 2: `, clientDataJson);
        console.log(`challenge 2: `, clientDataJson.challenge);

        const res = await registerFinish(credential);

        console.log(`registerFinish(): `, res);
    }

    function registerStart(username) {
        return Endpoint({
            name: "register_start",
            url: `${baseUrl}/api/v1/users/register_start`,
            options: {
                credentials: 'include',
                // mode: 'cors',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            },
            data: { username },
            request: RegisterStartRequest(),
            response: RegisterStartResponse(),
            debug: true,
        }).send();
    }

    function registerFinish(credential) {
        return Endpoint({
            name: "register_finish",
            url: `${baseUrl}/api/v1/users/register_finish`,
            options: {
                credentials: 'include',
                // mode: 'cors',
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            },
            data: credential,
            request: RegisterFinishRequest(),
            response: RegisterFinishResponse(),
            debug: true,
        }).send();
    }

    function onAuthenticate() {
    }


    return Object.freeze({
        start,
        stop,
    });
}

export { WebAuthN };
