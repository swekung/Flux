import { equals, exists, xf, unwrap } from '../functions.js';
import { Url, BodyType, Res, Req,
         TextResponse, JsonResponse,
         Endpoint,
         } from './common.js';
import { models } from './models.js';
import { base64 } from './base64.js';

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
        console.log('original response');
        console.log(data);
        console.log(`typeof challenge: ${typeof data.publicKey.challenge}`);
        console.log(data.publicKey.challenge);
        console.log('end original response');

        data.publicKey.challenge = base64.stringToArray(
            base64.decode(data.publicKey.challenge, "base64UrlSafe")
        );
        data.publicKey.user.id = base64.stringToArray(
            base64.decode(data.publicKey.user.id, "base64UrlSafe")
        );

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
        console.log(`request to register_finish raw`, data);

        // let rawId = base64.arrayToString(data.rawId);
        // console.log(`rawId: Array[]: `, rawId);
        //     rawId = base64.encode(data.rawId, 'base64UrlSafe');
        // console.log(`rawId: Base64UrlSafe: `, rawId);
        let rawId = data.id;
        let attestationObject = base64.arrayToString(data.response.attestationObject);
            attestationObject = base64.encode(attestationObject, 'base64UrlSafe');

        console.log(`clientDataJSON: Array[]: `,
                    new Uint8Array(data.response.clientDataJSON));
        console.log(`clientDataJSON: utf-8: `,
                    base64.utf8Decoder(data.response.clientDataJSON));
        let clientDataJSON = base64.arrayToString(data.response.clientDataJSON);
        console.log(`clientDataJSON: after base64 encoding: `, clientDataJSON);

        const encoded = {
            id: data.id,
            rawId,
            response: { attestationObject, clientDataJSON, },
            type: data.type,
            authenticatorAttachment: data.authenticatorAttachment,
            extensions: data.getClientExtensionResults(),
        };

        console.log(`request to register_finish: serialized: `, encoded);
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
        bodyType: BodyType.Text,
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

        var clientDataJson = JSON.parse(base64.utf8Decoder(credential.response.clientDataJSON));
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

