/**
 * @jest-environment jsdom
 */

import { xf } from '../../src/functions.js';
import { base64url } from '../../src/models/common.js';

describe('Base64', () => {
    describe('encode', () => {

        // as comming form server already base64url encoded in typed array
        const challengeRaw = new Uint8Array([146, 144, 158, 31, 81, 46, 89, 40, 14, 189, 185, 20, 36, 147, 101, 245, 56, 54, 62, 141, 147, 73, 18, 143, 199, 97, 31, 42, 126, 20, 0]);

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

        function charToBase64Code(char, alphabet = alphabets.base64.decoder) {
            return alphabet[char];
        }

        function stringToAsciiCodes(s) {
            return s.split('').map(charToAsciiCode);
        }

        function stringToBase64Codes(s) {
            return s.split('').map(x => charToBase64Code(x));
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
        function getPadLength(x) {
            return x % 3 === 0 ? 0 : 3 - (x % 3);
        }

        // Enum{0,1,2}, [Int] -> [Int]
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

        // Base64 String, [Int] -> [Int]
        function unpad(s, codes) {
            const padLength = (s.match(/=/g)||[]).length;
            if(padLength === 0) return codes;
            if(padLength === 1) {
                codes.pop();
                return codes;
            }
            codes.pop();
            codes.pop();
            return codes;
        }


        // String -> Base64 String
        function encode(s, alphabet = alphabets.base64.encoder) {
            // const padLength = getPadLength(s.length);
            // return partition(stringToAsciiCodes(s), 3, 0).flatMap(xs => {
            //     return splitByNBits(concatBits(xs), 6);
            // });

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

        function decode(s, alphabet = alphabets.base64.decoder) {
            const base64Codes = stringToBase64Codes(s);
            // console.log(base64Codes);

            const partitions = partition(base64Codes, 4);
            // console.log(partitions);

            const asciiCodes = partitions.flatMap(xs => {
                return splitByNBits(concatBits(xs, 6), 8);
            });
            // console.log(asciiCodes);

            const asciiCodesUnpadded = unpad(s, asciiCodes);
            // console.log(asciiCodesUnpadded);

            return asciiCodesUnpadded.map(asciiCodeToChar).join('');
        }

        test('init', () => {
            expect(1).toEqual(1);
        });

        test('decode Base64 basic', () => {
            expect(decode("TWFu")).toEqual("Man");
            expect(decode("SGV5")).toEqual("Hey");
            expect(decode("TWFuSGV5")).toEqual("ManHey");
            expect(decode("Zm8=")).toEqual("fo");
        });

        test('decode Base64 rfc4648 10. Test Vectors', () => {
            expect(decode("Zg==")).toEqual("f");
            expect(decode("Zm8=")).toEqual("fo");
            expect(decode("Zm9v")).toEqual("foo");
            expect(decode("Zm9vYg==")).toEqual("foob");
            expect(decode("Zm9vYmE=")).toEqual("fooba");
            expect(decode("Zm9vYmFy")).toEqual("foobar");
        });

        test('encode Base64 basic', () => {
            expect(encode("Man")).toEqual("TWFu");
            expect(encode("Hey")).toEqual("SGV5");
            expect(encode("ManHey")).toEqual("TWFuSGV5");
        });

        test('encode Base64 rfc4648 10. Test Vectors', () => {
            expect(encode("f")).toEqual("Zg==");
            expect(encode("fo")).toEqual("Zm8=");
            expect(encode("foo")).toEqual("Zm9v");
            expect(encode("foob")).toEqual("Zm9vYg==");
            expect(encode("fooba")).toEqual("Zm9vYmE=");
            expect(encode("foobar")).toEqual("Zm9vYmFy");
        });

        test('partition', () => {
            expect(partition([1,1,2,2], 4)).toEqual([[1,1,2,2]]);
            expect(partition([1,1,2,2], 2)).toEqual([[1,1],[2,2]]);
            expect(partition([1,1,2,2], 1)).toEqual([[1],[1],[2],[2]]);

            expect(partition([1,1,2,2], 3)).toEqual([[1,1,2],[2]]);
            expect(partition([1,1,2,2], 3, 0)).toEqual([[1,1,2],[2,0,0]]);
        });

        test('string to ASCII codes array', () => {
            expect(stringToAsciiCodes("Man")).toEqual([77,97,110]);
            expect(stringToAsciiCodes("ManHey")).toEqual([77,97,110,72,101,121]);
        });

        test('concat the bits of each member of an array into a number', () => {
            // xs = [77,97,110]
            // sum = (xs[0] << (8 * 2)) + (xs[1] << (8 * 1)) + (xs[2] << (8 * 0));
            // (sum).toString(2).padStart(24, '0').split('')
            expect(concatBits([])).toEqual(0);
            expect(concatBits([77])).toEqual(77);
            expect(concatBits([77,97])).toEqual(19809);
            expect(concatBits([77,97,110])).toEqual(5071214);
            expect(concatBits([77,97,110,72])).toEqual(1298230856);
        });

        test('split a number into n bit numbers', () => {
            expect(splitByNBits(5071214)).toEqual([19,22,5,46]);
        });

        test('array of 8 bit numbers to array of 6 bit numbers', () => {
            expect(splitByNBits(concatBits([77,97,110]), 8)).toEqual([77,97,110]);
            expect(splitByNBits(concatBits([77,97,110]), 6)).toEqual([19,22,5,46]);
            expect(splitByNBits(concatBits([77,97,110]), 4)).toEqual([4,13,6,1,6,14]);
            expect(splitByNBits(concatBits([77,97,110]), 2)).toEqual([1,0,3,1,1,2,0,1,1,2,3,2]);
            expect(splitByNBits(concatBits([72,101,121]), 2)).toEqual([1,0,2,0,1,2,1,1,1,3,2,1]);
        });
    });
});
