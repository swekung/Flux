import { equals } from '../functions.js';

function Url(str) {
    let url = undefined;

    try {
        url = new URL(str);
    } catch(e) {
        console.error(`Can't convert ${str} to a valid url.`);
    } finally {
        return url;
    }
}

const BodyType = Object.freeze({
    Json: 'json',
    Text: 'text',
    FormData: 'formData',
});

function Req(args = {}) {
    const defaults = {
        type: `[]`,
        bodyType: BodyType.Json,
    };

    const type      = args.type ?? defaults.type;
    const bodyType  = args.bodyType ?? defaults.BodyType;
    const check     = args.check ?? defaultCheck;
    const fallback  = args.fallback ?? defaultsFallback;
    const serialize = args.serialize ?? defaultSerialize;

    function defaultCheck() { return true; }
    function defaultsFallback() { return []; }
    function defaultSerialize() { return []; }

    return Object.freeze({
        type,
        bodyType,
        check,
        fallback,
        serialize,
    });
}

function Res(args = {}) {
    const defaults = {
        bodyType: BodyType.Json,
        type: `[]`,
    };

    const type        = args.type ?? defaults.type;
    const bodyType    = args.bodyType ?? defaults.bodyType;
    const fallback    = args.fallback ?? defaultFallback;
    const check       = args.check ?? defaultCheck;
    const deserialize = args.deserialize ?? defaultDeserialize;

    function defaultCheck() { return true; }
    function defaultFallback() { return []; }
    function defaultDeserialize(data) { return data; }

    return Object.freeze({
        bodyType,
        type,
        check,
        fallback,
        deserialize,
    });
}

function TextResponse(args = {}) {
    return Res(Object.assign(args, {bodyType: BodyType.Text}));
}

function JsonResponse(args = {}) {
    return Res(Object.assign(args, {bodyType: BodyType.Json}));
}

function FormDataResponse(args) {
    return Res(Object.assign(args, {bodyType: BodyType.FormData}));
}

function Endpoint(args = {}) {
    const defaults = {
        name: "unnamed",
        options: {},
        debug: false,
    };
    const name      = args.name ?? defaults.name;
    const options   = args.options ?? defaults.options;
    const request   = args.request ?? Req();
    const response  = args.response ?? Res();
    const debug     = args.debug ?? defaults.debug;
    const urlOption = Url(args.url ?? "");
    let url;

    if(urlOption) {
        url = urlOption;
    } else {
        console.error(`${name} endpoint configured with invalid or no url.`);
        return Object.freeze({
            send: ((x) => x)
        });
    }

    if(args.data) {
        if(request.check(args.data)) {
            options.body = request.serialize(args.data);
        } else {
            console.error(`${name} endpoint given invalid request body. Not sending the request.`);
            return Object.freeze({
                send: ((x) => x)
            });
        }
    }

    async function send() {
        let responseOption;
        try {
            responseOption = await fetch(url, options);
        } catch(err) {
            console.error(`Can't access ${name} endpoint.`);
        } finally {
            if(responseOption) {
                let resultOption;
                try {
                    resultOption = await responseOption[response.bodyType]();
                } catch(err) {
                    console.error(`Can't derive ${response.bodyType} from ${name} repsonse body.`);
                    return response.fallback();
                } finally {
                    if(resultOption) {
                        if(debug) {
                            console.log(`${name} got response: `);
                            console.log(resultOption);
                        }
                        if(response.check(resultOption)) {
                            return response.deserialize(resultOption);
                        }
                        return response.fallback();
                    } else {
                        return response.fallback();
                    }
                }
            }
            console.warn(`Don't know how to handle response from ${name} endpoint, returning fallback: ${typeof response.fallback()}`, response.fallback());
            return response.fallback();
        }
    }

    return Object.freeze({
        send,
    });
}


function Base64url() {

// function decode(s) {
//     const _U8Afrom = (s) => Uint8Array.from.bind(Uint8Array)(s);
//     const _atob = (s) => atob(_tidyB64(s));
//     const _toUint8Array = (s) => _U8Afrom(_atob(s), c => c.charCodeAt(0));
//     const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
//     const _decode = (s) => {
//         _TD.decode(_toUint8Array(s));
//     };
//     const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
//     const _unURI = (s) => {
//         _tidyB64(s.replace(/[-_]/g, (x) => x == '-' ? '+' : '/'));
//     };

//     return _decode(_unURI(s));
// }

// function encode(s) {
//     const _mkUriSafe = (s) => s
//           .replace(/=/g, '')
//           .replace(/[+\/]/g, (x) => x == '+' ? '-' : '_');

//     const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;

//     const _fromCC = String.fromCharCode.bind(String);
//     const _btoa = (s) => btoa(s);
//     const _encode = (s) => _fromUint8Array(_TE.encode(s));

//     const _fromUint8Array = (u8a) => {
//         const maxargs = 0x1000;
//         let strs = [];
//         for (let i = 0, l = u8a.length; i < l; i += maxargs) {
//             strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
//         }
//         return _btoa(strs.join(''));

//         return _mkUriSafe(_encode(s));
//     };
// }

    // const _U8Afrom = Uint8Array.from.bind(Uint8Array);
    // const _atob = (s) => atob(_tidyB64(s));

    function fromUint8Array(u8a) {
        if(u8a instanceof ArrayBuffer) u8a = new Uint8Array(u8a);
        const _fromCC = String.fromCharCode.bind(String);
        const maxargs = 0x1000;
        let strs = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return btoa(strs.join(''));
    }

    function toUint8Array(s) {
        const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
        return Uint8Array.from(atob(_tidyB64(s)), c => c.charCodeAt(0));
    }

    function encode(s) {
        const _mkUriSafe = (s) => s
            .replace(/=/g, '')
            .replace(/[+\/]/g, (x) => x == '+' ? '-' : '_');

        const textEncoder = new TextEncoder(); // 'utf-8'
        const _encode = (s) => Uint8Array.from(fromUint8Array(textEncoder.encode(s)));

        return _mkUriSafe(_encode(s));
    }

    function decode(s) {
        const _decode = (s) => {
            const textDecoder = new TextDecoder(); // 'utf-8'
            const textEncoder = new TextEncoder(); // 'utf-8'

            return textDecoder.decode(Uint8Array.from(
                atob(s),
                c => c.charCodeAt(0)
            ));
            // return textDecoder.decode(textEncoder.encode(atob(s)));
        };
        const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
        const _unURI = (s) => _tidyB64(s.replace(/[-_]/g, (x) => x == '-' ? '+' : '/'));

        return _decode(_unURI(s));
    }

    return Object.freeze({
        encode,
        decode,
        toUint8Array,
        fromUint8Array,
    });
}

// var buf = (new Uint8Array([
//     232, 218, 229, 62, 165, 73, 16, 93, 246, 151, 212, 117, 29, 219, 4, 53, 58, 77, 210, 186, 42, 42, 233, 218, 81, 176, 174, 200, 99, 121, 67, 198,])).buffer;
// var bufString = fromUint8Array(buf);
// var base64String = decode(bufString);
// var stringT = encode(base64String);
// var bufT = toUint8Array(stringT);
// console.log(buf);
// console.log(bufString);
// console.log(base64String);
// console.log(stringT);
// console.log(bufT);

const base64url = Base64url();

export {
    Url,
    BodyType,
    Req,
    Res,
    TextResponse,
    JsonResponse,
    FormDataResponse,
    Endpoint,
    base64url,
}

