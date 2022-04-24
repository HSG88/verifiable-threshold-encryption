"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePolynomial = exports.decode = exports.encode = exports.decrypt = exports.encrypt = exports.genRandomBigInt = exports.poseidonCommitment = exports.PRIME = void 0;
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
const ffjavascript_1 = require("ffjavascript");
const { mimc7, poseidon } = require('circomlibjs');
const PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
exports.PRIME = PRIME;
const F = new ffjavascript_1.ZqField(PRIME); // bn128
const powers = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
    [1, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049],
    [1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144, 1048576],
    [1, 5, 25, 125, 625, 3125, 15625, 78125, 390625, 1953125, 9765625],
    [1, 6, 36, 216, 1296, 7776, 46656, 279936, 1679616, 10077696, 60466176],
    [1, 7, 49, 343, 2401, 16807, 117649, 823543, 5764801, 40353607, 282475249],
    [1, 8, 64, 512, 4096, 32768, 262144, 2097152, 16777216, 134217728, 1073741824],
    [1, 9, 81, 729, 6561, 59049, 531441, 4782969, 43046721, 387420489, 3486784401],
    [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 1000000000, 10000000000, 100000000000],
];
function genRandomBigInt() {
    return F.random();
}
exports.genRandomBigInt = genRandomBigInt;
function encrypt(key, message) {
    const iv = mimc7.hash(genRandomBigInt(), 91) % PRIME;
    const ciphertext = message.map((e, i) => (e
        + mimc7.hash(iv + BigInt(i), key, 91)) % PRIME);
    return { ciphertext, iv };
}
exports.encrypt = encrypt;
function decrypt(key, cipher) {
    const message = [];
    const { ciphertext, iv } = cipher;
    for (let i = 0; i < ciphertext.length; i++) {
        message.push(ciphertext[i] - mimc7.hash(iv + BigInt(i), key, 91));
    }
    return message;
}
exports.decrypt = decrypt;
function encode(buffer) {
    if (buffer.length % 31 !== 0) {
        throw new Error('Buffer length must multiple of 31');
    }
    const data = [];
    const length = buffer.length / 31;
    for (let i = 0; i < length; i++) {
        data.push(BigInt(`0x${buffer.slice(i * 31, (i + 1) * 31).toString('hex')}`));
    }
    return data;
}
exports.encode = encode;
function decode(data) {
    const array = [];
    for (let i = 0; i < data.length; i++) {
        const str = data[i].toString(16).padStart(62, '0');
        array.push(Buffer.from(str, 'hex'));
    }
    return Buffer.concat(array);
}
exports.decode = decode;
function poseidonCommitment(value, randomness) {
    return poseidon([value, randomness]);
}
exports.poseidonCommitment = poseidonCommitment;
function evaluatePolynomial(coefficients, x) {
    if (x > 10n) {
        throw new Error('Supporting up to x=10 only');
    }
    let y = F.zero;
    for (let i = 0; i < coefficients.length; i++) {
        const term = BigInt(powers[Number(x - 1n)][i]);
        y = F.add(y, F.mul(coefficients[i], term));
        // console.log(`y: ${y}\nTerm:${term}\nCoefficient: ${coefficients[i]}`);
    }
    return y;
}
exports.evaluatePolynomial = evaluatePolynomial;
//# sourceMappingURL=utils.js.map