/**
 * @jest-environment jsdom
 */

import { xf } from '../../src/functions.js';
import { base64 } from '../../src/models/base64.js';

describe('Base64', () => {
    describe('encode', () => {

        // as comming form server already base64url encoded in typed array
        const challengeRaw = new Uint8Array([146, 144, 158, 31, 81, 46, 89, 40, 14, 189, 185, 20, 36, 147, 101, 245, 56, 54, 62, 141, 147, 73, 18, 143, 199, 97, 31, 42, 126, 20, 0]);

        test('init', () => {
            expect(1).toEqual(1);
        });

        test('decode Base64 basic', () => {
            expect(base64.decode("TWFu")).toEqual("Man");
            expect(base64.decode("SGV5")).toEqual("Hey");
            expect(base64.decode("TWFuSGV5")).toEqual("ManHey");
            expect(base64.decode("Zm8=")).toEqual("fo");
        });

        test('decode Base64 rfc4648 10. Test Vectors', () => {
            expect(base64.decode("Zg==")).toEqual("f");
            expect(base64.decode("Zm8=")).toEqual("fo");
            expect(base64.decode("Zm9v")).toEqual("foo");
            expect(base64.decode("Zm9vYg==")).toEqual("foob");
            expect(base64.decode("Zm9vYmE=")).toEqual("fooba");
            expect(base64.decode("Zm9vYmFy")).toEqual("foobar");
        });

        test('encode Base64 basic', () => {
            expect(base64.encode("Man")).toEqual("TWFu");
            expect(base64.encode("Hey")).toEqual("SGV5");
            expect(base64.encode("ManHey")).toEqual("TWFuSGV5");
        });

        test('encode Base64 rfc4648 10. Test Vectors', () => {
            expect(base64.encode("f")).toequal("zg==");
            expect(base64.encode("fo")).toequal("zm8=");
            expect(base64.encode("foo")).toequal("zm9v");
            expect(base64.encode("foob")).toequal("zm9vyg==");
            expect(base64.encode("fooba")).toequal("zm9vyme=");
            expect(base64.encode("foobar")).toequal("zm9vymfy");
        });

        test('partition', () => {
            expect(base64.partition([1,1,2,2], 4)).toEqual([[1,1,2,2]]);
            expect(base64.partition([1,1,2,2], 2)).toEqual([[1,1],[2,2]]);
            expect(base64.partition([1,1,2,2], 1)).toEqual([[1],[1],[2],[2]]);

            expect(base64.partition([1,1,2,2], 3)).toEqual([[1,1,2],[2]]);
            expect(base64.partition([1,1,2,2], 3, 0)).toEqual([[1,1,2],[2,0,0]]);
        });

        test('string to ASCII codes array', () => {
            expect(base64.stringToAsciiCodes("Man")).toEqual([77,97,110]);
            expect(base64.stringToAsciiCodes("ManHey")).toEqual([77,97,110,72,101,121]);
        });

        test('concat the bits of each member of an array into a number', () => {
            // xs = [77,97,110]
            // sum = (xs[0] << (8 * 2)) + (xs[1] << (8 * 1)) + (xs[2] << (8 * 0));
            // (sum).toString(2).padStart(24, '0').split('')
            expect(base64.concatBits([])).toEqual(0);
            expect(base64.concatBits([77])).toEqual(77);
            expect(base64.concatBits([77,97])).toEqual(19809);
            expect(base64.concatBits([77,97,110])).toEqual(5071214);
            expect(base64.concatBits([77,97,110,72])).toEqual(1298230856);
        });

        test('split a number into n bit numbers', () => {
            expect(base64.splitByNBits(5071214)).toEqual([19,22,5,46]);
        });

        test('array of 8 bit numbers to array of 6 bit numbers', () => {
            expect(base64.splitByNBits(base64.concatBits([77,97,110]), 8))
                .toEqual([77,97,110]);
            expect(base64.splitByNBits(base64.concatBits([77,97,110]), 6))
                .toEqual([19,22,5,46]);
            expect(base64.splitByNBits(base64.concatBits([77,97,110]), 4))
                .toEqual([4,13,6,1,6,14]);
            expect(base64.splitByNBits(base64.concatBits([77,97,110]), 2))
                .toEqual([1,0,3,1,1,2,0,1,1,2,3,2]);
            expect(base64.splitByNBits(base64.concatBits([72,101,121]), 2))
                .toEqual([1,0,2,0,1,2,1,1,1,3,2,1]);
        });
    });
});

// - challenge comes from server unpadded
// - challenge get double base64 encoded in the client



// Run 1:
// Server records to session and sends as json:
// challenge: Base64UrlSafeData(
//     [93, 209, 166, 126, 236, 108, 162, 62, 17, 116, 236, 60, 97, 68, 98, 65, 45,
//      235, 193, 1, 141, 127, 43, 2, 14, 126, 76, 152, 237, 39, 13, 124,]
// )

// which encodes to string:
// "]Ñ¦~ìl¢>\x11tì<aDbA-ëÁ\x01\x8D\x7F+\x02\x0E~L\x98í'\r|"

// which encodes to base64UrlSafe as:
// 'XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDXw='

// but client receives unpadded version instaed:
// "XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDXw"

// and now encoding this as array for navigator.credentials.create() gets us:
// challenge: [88, 100, 71, 109, 102, 117, 120, 115, 111, 106, 52, 82, 100, 79,
//             119, 56, 89, 85, 82, 105, 81, 83, 51, 114, 119, 81, 71, 78, 102,
//             121, 115, 67, 68, 110, 53, 77, 109, 79, 48, 110, 68, 88, 119]


// which is this string:
// 'XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDXw'

// and base64UrlSafe encoded is:
// 'WGRHbWZ1eHNvajRSZE93OFlVUmlRUzNyd1FHTmZ5c0NEbjVNbU8wbkRYdw=='


// challenge in clientDataJSON:
// "WGRHbWZ1eHNvajRSZE93OFlVUmlRUzNyd1FHTmZ5c0NEbjVNbU8wbkRYdw"
//
// when decoded it is very close but incorrectly padded:
// "XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDX\x00\x07p"

// the whole process:
// base64.stringToArray(base64.decode(base64.arrayToString(base64.stringToArray(btoa(atob(base64.arrayToString(chClient)))))))



// Run 2:
// from another run atob breaks when client receives the challenge:
// challenge: "cg9-dfv-1nbj7A-XWnNBY35aOtQ8jITBYtxJa_ClZjM"




/*

// Raw Data
// Step 1:
// Client Sends:
{username: "zwiftuser"}

// Step 2:
// server records into session:
let reg_state = PasskeyRegistration {
    rs: RegistrationState {
        policy: Preferred,
        exclude_credentials: [],
        challenge: Base64UrlSafeData(
            [240, 132, 220, 165, 193, 228, 52, 118, 186, 80, 72, 94, 73, 170, 39, 97,
             128, 144, 21, 92, 139, 106, 252, 204, 27, 116, 51, 219, 72, 152,
             77, 124,],
        ),
        credential_algorithms: [ES256, RS256,],
        require_resident_key: false,
        authenticator_attachment: None,
        extensions: RequestRegistrationExtensions {
            cred_protect: None,
            uvm: Some(true,),
            cred_props: Some(true,),
            min_pin_length: None,
            hmac_create_secret: None,
        },
        experimental_allow_passkeys: true,
    },
}

// Server responds:
let server_res1 = Json(
    CreationChallengeResponse {
        public_key: PublicKeyCredentialCreationOptions {
            rp: RelyingParty {
                name: "flux-web",
                id: "localhost",
            },
            user: User {
                id: Base64UrlSafeData(
                    [98, 2, 77, 35, 48, 169, 68, 166, 148, 236, 146, 175, 86, 147,
                     153, 217,],
                ),
                name: "zwiftuser",
                display_name: "zwiftuser",
            },
            challenge: Base64UrlSafeData(
                [240, 132, 220, 165, 193, 228, 52, 118, 186, 80, 72, 94, 73, 170, 39,
                 97, 128, 144, 21, 92, 139, 106, 252, 204, 27, 116, 51, 219, 72,
                 152, 77, 124,],
            ),
            pub_key_cred_params: [
                PubKeyCredParams {type_: "public-key", alg: -7,},
                PubKeyCredParams {type_: "public-key", alg: -257,},
            ],
            timeout: Some(60000,),
            attestation: Some(None,),
            exclude_credentials: None,
            authenticator_selection: Some(
                AuthenticatorSelectionCriteria {
                    authenticator_attachment: None,
                    require_resident_key: false,
                    user_verification: Preferred,
                },
            ),
            extensions: Some(
                RequestRegistrationExtensions {
                    cred_protect: None,
                    uvm: Some(true,),
                    cred_props: Some(true,),
                    min_pin_length: None,
                    hmac_create_secret: None,
                },
            ),
        },
    },
);

// Client receives:
"8ITcpcHkNHa6UEheSaonYYCQFVyLavzMG3Qz20iYTXw"
"8ITcpcHkNHa6UEheSaonYYCQFVyLavzMG3Qz20iYTXw"

"YgJNIzCpRKaU7JKvVpOZ2Q"

var res1 = {
    "publicKey": {
        "rp": {"name": "flux-web", "id": "localhost"},
        "user": {
            "id": [89, 103, 74, 78, 73, 122, 67, 112, 82, 75, 97, 85, 55, 74, 75,
                   118, 86, 112, 79, 90, 50, 81],
            "name": "zwiftuser",
            "displayName": "zwiftuser"
        },
        "challenge": [
            56, 73, 84, 99, 112, 99, 72, 107, 78, 72, 97, 54, 85, 69, 104, 101, 83,
            97, 111, 110, 89, 89, 67, 81, 70, 86, 121, 76, 97, 118, 122, 77, 71, 51,
            81, 122, 50, 48, 105, 89, 84, 88, 119],
        "pubKeyCredParams": [
            {"type": "public-key", "alg": -7}, {"type": "public-key", "alg": -257}
        ],
        "timeout": 60000,
        "attestation": "none",
        "authenticatorSelection": {
            "requireResidentKey": false,
            "userVerification": "preferred"
        },
        "extensions": {"uvm": true, "credProps": true}
    }
};


// Client creates credentials:

// clientDataJSON
// raw

// decoded
var clientDataJSON: {
    "type": "webauthn.create",
    "challenge": "OElUY3BjSGtOSGE2VUVoZVNhb25ZWUNRRlZ5TGF2ek1HM1F6MjBpWVRYdw",
    "origin": "http://localhost:1234",
    "crossOrigin": false
};

*/
