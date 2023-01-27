function Base64() {
    // rfc4648, Table 1: The Base 64 Alphabet
    //
    // 0 A           17 R            34 i            51 z
    // 1 B           18 S            35 j            52 0
    // 2 C           19 T            36 k            53 1
    // 3 D           20 U            37 l            54 2
    // 4 E           21 V            38 m            55 3
    // 5 F           22 W            39 n            56 4
    // 6 G           23 X            40 o            57 5
    // 7 H           24 Y            41 p            58 6
    // 8 I           25 Z            42 q            59 7
    // 9 J           26 a            43 r            60 8
    // 10 K          27 b            44 s            61 9
    // 11 L          28 c            45 t            62 +
    // 12 M          29 d            46 u            63 /
    // 13 N          30 e            47 v
    // 14 O          31 f            48 w         (pad) =
    // 15 P          32 g            49 x
    // 16 Q          33 h            50 y

    const alphabets = {
        base64: {
            encoder: [
            "A","B","C","D","E","F", "G","H","I","J","K",
                "L","M","N","O","P", "Q","R","S","T","U",
                "V","W","X","Y","Z", "a","b","c","d","e",
                "f","g","h","i","j", "k","l","m","n","o",
                "p","q","r","s","t", "u","v","w","x","y",
                "z","0","1","2","3", "4","5","6","7","8",
                "9","+","/"," ","="
            ],
            decoder: {
        "A":0,"B": 1,"C": 2,"D": 3,"E": 4,"F": 5, "G": 6,"H": 7,"I": 8,"J": 9,"K":10,
            "L":11,"M":12,"N":13,"O":14,"P":15, "Q":16,"R":17,"S":18,"T":19,"U":20,
            "V":21,"W":22,"X":23,"Y":24,"Z":25, "a":26,"b":27,"c":28,"d":29,"e":30,
            "f":31,"g":32,"h":33,"i":34,"j":35, "k":36,"l":37,"m":38,"n":39,"o":40,
            "p":41,"q":42,"r":43,"s":44,"t":45, "u":46,"v":47,"w":48,"x":49,"y":50,
            "z":51,"0":52,"1":53,"2":54,"3":55, "4":56,"5":57,"6":58,"7":59,"8":60,
            "9":61,"+":62,"/":63," ":64,"=":65},
        },
        base64UrlSafe: {
            encoder: [
            "A","B","C","D","E","F", "G","H","I","J","K",
                "L","M","N","O","P", "Q","R","S","T","U",
                "V","W","X","Y","Z", "a","b","c","d","e",
                "f","g","h","i","j", "k","l","m","n","o",
                "p","q","r","s","t", "u","v","w","x","y",
                "z","0","1","2","3", "4","5","6","7","8",
                "9","-","_"," ","="
            ],
            decoder: {
        "A":0,"B": 1,"C": 2,"D": 3,"E": 4,"F": 5, "G": 6,"H": 7,"I": 8,"J": 9,"K":10,
            "L":11,"M":12,"N":13,"O":14,"P":15, "Q":16,"R":17,"S":18,"T":19,"U":20,
            "V":21,"W":22,"X":23,"Y":24,"Z":25, "a":26,"b":27,"c":28,"d":29,"e":30,
            "f":31,"g":32,"h":33,"i":34,"j":35, "k":36,"l":37,"m":38,"n":39,"o":40,
            "p":41,"q":42,"r":43,"s":44,"t":45, "u":46,"v":47,"w":48,"x":49,"y":50,
            "z":51,"0":52,"1":53,"2":54,"3":55, "4":56,"5":57,"6":58,"7":59,"8":60,
            "9":61,"-":62,"_":63," ":64,"=":65
            },
        },
    };

    function charToAsciiCode(char) {
        return char.charCodeAt(0);
    }

    function asciiCodeToChar(code) {
        return String.fromCharCode(code);
    }

    function stringToAsciiCodes(s) {
        return s.split('').map(charToAsciiCode);
    }

    function stringToBase64Codes(s, alphabet) {
        return s.split('').map(x => {
            let res = alphabet[x];
            if(res === undefined || res === null) {
                console.log(`stringToBase64Codes could not decode ${x}`);
            }
            return res;
        });
    }

    // Number -> ['Bit']
    function numberToBits(x, size=8) {
        return (x).toString(2).padStart(size, '0').split('');
    }

    // [T], Int, <undefined, T> -> [[T]]
    function partition(xs, size, pad=undefined) {
        let part = [];
        return xs.reduce((acc, x, i) => {
            part.push(x);
            if(i === xs.length-1 && part.length < size) {
                if(pad !== undefined) {
                    part = Array.from({...part, length: size}, (v) => v ?? pad);
                }
                acc.push(part);
                part = [];
            }
            if(part.length === size) {
                acc.push(part);
                part = [];
            }
            return acc;
        }, []);
    }

    // [Int] -> Number
    function concatBits(xs, bitStep=8) {
        return xs.reduce((sum, x, i, xs) => {
            sum += xs[i] << (bitStep * (xs.length - (i + 1)));
            return sum;
        }, 0);
    }

    // Number, Int, Int -> [Int]
    function splitByNBits(x, n = 6, size=8*3) {
        const mask = (2**(n)-1);

        function offsetMask(index) {
            return (mask << (n * index));
        }

        return Array
            .from({length: size/n}, (v, i) => i)
            .reduce((acc, i) => {
                acc.push((x & offsetMask((size/n) - i - 1)) >> n * ((size/n) - i -1));
                return acc;
            }, []);
    }

    // Int -> Int
    function div3(n) {
        if(n % 3 === 0) return n;
        return div3(n+1);
    }

    // Int -> Enum{0,1,2}
    function getPadLength(stringLength) {
        return stringLength % 3 === 0 ? 0 : 3 - (stringLength % 3);
    }

    // Base64 String, [Int] -> [Int]
    function pad(encodedString, codes, padCode = 65) {
        const padLength = getPadLength(encodedString.length);
        if(padLength === 0) return codes;
        if(padLength === 1) {
            codes[codes.length-1] = padCode;
            return codes;
        }
        codes[codes.length-1] = padCode;
        codes[codes.length-2] = padCode;
        return codes;
    }

    function Alphabet(code) {
        return alphabets[code];
    }

    const Encoding = {
        Base64: "base64",
        Base64UrlSafe: "base64UrlSafe",
    };

    // String, Encoding -> Base64 String
    function encode(s, encoding = "base64") {
        const alphabet = (Alphabet(encoding)).encoder;

        const asciiCodes = stringToAsciiCodes(s);
        // console.log(asciiCodes);

        const partitions = partition(asciiCodes, 3, 0);
        // console.log(partitions);

        const base64Codes = partitions.flatMap(xs => {
            return splitByNBits(concatBits(xs), 6);
        });
        // console.log(base64codes);

        const base64CodesPadded = pad(s, base64Codes);
        // console.log(base64CodesPadded);

        return base64CodesPadded.map((code) => {
            // console.log(`${code} ${alphabet[code]}`);
            return alphabet[code];
        }).join('');
    }

    // Base64 String, [Int] -> [Int]
    function unpad(s, codes) {
        const padLength = (s.match(/=/g)||[]).length;
        // const padLength = getPadLength(s.length);
        if(padLength === 0) return codes;
        if(padLength === 1) {
            codes.pop();
            return codes;
        }
        codes.pop();
        codes.pop();
        return codes;
    }

    // Base64 String -> Base64 String
    function fixPadding(s) {
        console.log(s);
        if(s.length % 3 === 1) s+="==";
        if(s.length % 3 === 2) s+="=";
        console.log(s);
        return s;
    }

    // Base64 String, Encoding -> String
    function decode(s, encoding = "base64") {
        const alphabet = (Alphabet(encoding)).decoder;

        const base64Codes = stringToBase64Codes(s, alphabet);
        // console.log(base64Codes);

        const partitions = partition(base64Codes, 4);
        // console.log(partitions);

        const asciiCodes = partitions.flatMap(xs =>
            splitByNBits(concatBits(xs, 6), 8)
        );
        // console.log(asciiCodes);

        const asciiCodesUnpadded = unpad(s, asciiCodes);
        // console.log(asciiCodesUnpadded);

        return asciiCodesUnpadded.map(asciiCodeToChar).join('');
    }

    // <ArrayBuffer, Array, Uint8Array> -> Ascii String
    function arrayToString(xs) {
        function fromUint8Array(u8a) {
            const maxargs = 0x1000;
            const chars = [];
            for (let i = 0, l = u8a.length; i < l; i += maxargs) {
                chars.push(
                    String.fromCharCode.apply(null, u8a.subarray(i, i + maxargs))
                );
            }
            return btoa(chars.join(''));
        }

        if(xs instanceof ArrayBuffer || Array.isArray(xs)) {
            xs = new Uint8Array(xs);
        }
        return fromUint8Array(xs);
    }

    function cleanUp(s) {
        return s
            .replace(/[-_]/g, (x) => x == '-' ? '+' : '/')
            .replace(/[^A-Za-z0-9\+\/]/g, '');
    }

    // String -> Uint8Array[Ascii Char]
    function stringToArray(s) {
        return Uint8Array.from(atob(cleanUp(s)), c => c.charCodeAt(0));
    }

    // "Fa0vbwJrNI-_vD3S3ePx9NrJjzhFHnHDGb1g54eHtfw"
    //
    function stringToArray2(s) {
        return Uint8Array.from(decode(s, 'base64UrlSafe'), ch => {
            let res = ch.charCodeAt(0);
            return res;
        });
    }

    // ArrayBuffer -> Utf-8 String
    function utf8Decoder(arrayBuffer) {
        const utf8Decoder = new TextDecoder('utf-8');
        return utf8Decoder.decode(arrayBuffer);
    }

    // String -> ArrayBuffer[Utf-8 Char]
    function utf8Encoder(str) {
        const utf8Encoder = new TextEncoder('utf-8');
        return utf8Encoder.encode(str);
    }

    return Object.freeze({
        // structs
        alphabets,
        Encoding,

        // main functions
        encode,
        decode,

        // auxilary functions
        arrayToString,
        stringToArray,
        stringToArray2, //
        utf8Decoder,
        utf8Encoder,

        // internal functions
        partition,
        stringToAsciiCodes,
        concatBits,
        splitByNBits,
    });
}

const base64 = Base64();

export {
    base64,
}
