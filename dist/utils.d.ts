/// <reference types="node" />
export declare type Ciphertext = {
    ciphertext: bigint[];
    iv: bigint;
};
declare const PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
declare function genRandomBigInt(): bigint;
declare function encrypt(key: bigint, message: bigint[]): Ciphertext;
declare function decrypt(key: bigint, cipher: Ciphertext): bigint[];
declare function encode(buffer: Buffer): bigint[];
declare function decode(data: bigint[]): Buffer;
declare function poseidonCommitment(value: bigint, randomness: bigint): bigint;
declare function evaluatePolynomial(coefficients: bigint[], x: bigint): bigint;
export { PRIME, poseidonCommitment, genRandomBigInt, encrypt, decrypt, encode, decode, evaluatePolynomial, };
