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
            expect(base64.encode("f")).toEqual("Zg==");
            expect(base64.encode("fo")).toEqual("Zm8=");
            expect(base64.encode("foo")).toEqual("Zm9v");
            expect(base64.encode("foob")).toEqual("Zm9vYg==");
            expect(base64.encode("fooba")).toEqual("Zm9vYmE=");
            expect(base64.encode("foobar")).toEqual("Zm9vYmFy");
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


        test('string to typed array', () => {

            expect(Array.from(base64.stringToArray(
                "XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDXw"
            ))).toEqual([
                93, 209, 166, 126, 236, 108, 162, 62, 17, 116, 236, 60, 97, 68, 98,
                65, 45, 235, 193, 1, 141, 127, 43, 2, 14, 126, 76, 152, 237, 39,
                13, 124
            ]);

            expect(Array.from(base64.stringToArray(
                "zYHK5U46vtmJ58en1_gzywqJJj89AXZwwckI2Q0D-s8"
            ))).toEqual([
                205, 129, 202, 229, 78, 58, 190, 217, 137, 231, 199, 167, 215, 248,
                51, 203, 10, 137, 38, 63, 61, 1, 118, 112, 193, 201, 8, 217, 13, 3,
                250, 207
            ]);

            expect(Array.from(base64.stringToArray(
                "Fa0vbwJrNI-_vD3S3ePx9NrJjzhFHnHDGb1g54eHtfw"
            ))).toEqual([
                21, 173, 47, 111, 2, 107, 52, 143, 191, 188, 61, 210, 221, 227, 241,
                244, 218, 201, 143, 56, 69, 30, 113, 195, 25, 189, 96, 231, 135,
                135, 181, 252
            ]);

            expect(Array.from(base64.stringToArray(
                "cg9-dfv-1nbj7A-XWnNBY35aOtQ8jITBYtxJa_ClZjM"
            ))).toEqual([
                114, 15, 126, 117, 251, 254, 214, 118, 227, 236, 15, 151, 90, 115,
                65, 99, 126, 90, 58, 212, 60, 140, 132, 193, 98, 220, 73, 107, 240,
                165, 102, 51
            ]);
        });

        test('array to string', () => {
            expect(base64.arrayToString([
                93, 209, 166, 126, 236, 108, 162, 62, 17, 116, 236, 60, 97, 68, 98,
                65, 45, 235, 193, 1, 141, 127, 43, 2, 14, 126, 76, 152, 237, 39,
                13, 124
                ])).toEqual(
                    "XdGmfuxsoj4RdOw8YURiQS3rwQGNfysCDn5MmO0nDXw="
                );
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

// from another couple of runs:
// with this challenge it passes
// challenge: "xHqr7njLwUSzJnDumdCgDm0bqdCEJNORjcSnrylT398"

// with those atob breaks:
// challenge: "cg9-dfv-1nbj7A-XWnNBY35aOtQ8jITBYtxJa_ClZjM"
// challenge: "Fa0vbwJrNI-_vD3S3ePx9NrJjzhFHnHDGb1g54eHtfw"

// Those work
// function fromUrlSafe(s) {
//     return s
//         .replace(/[-_]/g, (x) => x == '-' ? '+' : '/')
//         .replace(/[^A-Za-z0-9\+\/]/g, '');
// }

// function toUint8Array(s) {
//     const _atob = (s) => atob(_tidyB64(s));
//     const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
//     const _unURI = (s) =>
//           _tidyB64(s.replace(/[-_]/g, (x) => x == '-' ? '+' : '/'));
//     const _toUint8Array = (s) => Uint8Array.from(_atob(s), c => c.charCodeAt(0));
//     return _toUint8Array(_unURI(s));
// }

// function fromUint8Array(u8a) {
//     if(u8a instanceof ArrayBuffer) u8a = new Uint8Array(u8a);
//     const _fromCC = String.fromCharCode.bind(String);
//     const maxargs = 0x1000;
//     let strs = [];
//     for (let i = 0, l = u8a.length; i < l; i += maxargs) {
//         strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
//     }
//     return btoa(strs.join(''));
// }

