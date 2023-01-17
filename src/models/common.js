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

function Req() {
    const type = `[]`;
    function check() { return true; }
    function fallback() { return []; }
    function serialize() { return []; }

    return Object.freeze({
        type,
        check,
        fallback,
        serialize,
    });
}

function Res(args = {}) {
    const defaults = {
        bodyType: BodyType.Json,
    };

    const type = `[]`;
    const bodyType = args.bodyType ?? defaults.bodyType;
    function check() { return true; }
    function fallback() { return []; }
    function deserialize(data) { return data; }

    return Object.freeze({
        bodyType,
        type,
        check,
        fallback,
        deserialize,
    });
}

function TextResponse() {
    return Res({bodyType: BodyType.Text});
}

function JsonResponse() {
    return Res({bodyType: BodyType.Json});
}

function FormDataResponse() {
    return Res({bodyType: BodyType.FormData});
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

export {
    Url,
    BodyType,
    Req,
    Res,
    TextResponse,
    JsonResponse,
    FormDataResponse,
    Endpoint,
}

