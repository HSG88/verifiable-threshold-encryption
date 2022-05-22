/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import { ZqField } from 'ffjavascript';
import { KeyPair, Point } from './types';

const crypto = require('crypto');

const { poseidon, babyjub } = require('circomlibjs');

export type Ciphertext = {ciphertext: bigint[], iv: bigint};

const PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const F = new ZqField(PRIME); // bn128

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

function toBigInt(buffer: Buffer): bigint {
  let result = 0n;
  buffer.forEach((i) => {
    result = (result << 8n) + BigInt(i);
  });
  return result;
}

function genKeyPair(): KeyPair {
  const random = crypto.randomBytes(32);
  random[0] &= 0xF8;
  random[31] &= 0x7F;
  random[31] |= 0x40;
  const privateKey = toBigInt(random) >> 3n;
  const publicKey = babyjub.mulPointEscalar(babyjub.Base8, privateKey);
  return { privateKey, publicKey };
}

function genRandomBigInt(): bigint {
  return F.random();
}

function ecdh(sk: bigint, pk:Point): bigint {
  const shared = babyjub.mulPointEscalar(pk, sk);
  return poseidon(shared);
}
function encrypt(key: bigint, message: bigint[]): Ciphertext {
  const iv = genRandomBigInt();
  const ciphertext: bigint[] = [];
  ciphertext.push(F.add(poseidon([key, iv]), message[0]));
  for (let i = 1; i < message.length; i++) {
    ciphertext.push(F.add(poseidon([key, ciphertext[i - 1]]), message[i]));
  }
  return { ciphertext, iv };
}

function decrypt(key: bigint, cipher: Ciphertext): bigint[] {
  const { ciphertext, iv } = cipher;
  const message: bigint[] = [];
  message.push(F.sub(ciphertext[0], poseidon([key, iv])));
  for (let i = 1; i < ciphertext.length; i++) {
    message.push(F.sub(ciphertext[i], poseidon([key, ciphertext[i - 1]])));
  }
  return message;
}

function encode(buffer: Buffer):bigint[] {
  if (buffer.length % 31 !== 0) { throw new Error('Buffer length must multiple of 31'); }
  const data: bigint[] = [];
  const length = buffer.length / 31;
  for (let i = 0; i < length; i++) {
    data.push(BigInt(`0x${buffer.slice(i * 31, (i + 1) * 31).toString('hex')}`));
  }
  return data;
}

function decode(data: bigint[]):Buffer {
  const array: Buffer[] = [];
  for (let i = 0; i < data.length; i++) {
    const str = data[i].toString(16).padStart(62, '0');
    array.push(Buffer.from(str, 'hex'));
  }
  return Buffer.concat(array);
}

function evaluatePolynomial(coefficients: bigint[], x: bigint) : bigint {
  if (x > 10n) { throw new Error('Supporting up to x=10 only'); }
  let y = F.zero;
  for (let i = 0; i < coefficients.length; i++) {
    const term = BigInt(powers[Number(x - 1n)][i]);
    y = F.add(y, F.mul(coefficients[i], term));
  }
  return y;
}

function recoverSecret(points: Point[]):bigint {
  let result = 0n;
  for (let i = 0; i < points.length; i++) {
    let temp = 1n;
    for (let j = 0; j < points.length; j++) {
      if (i === j) { continue; }
      temp = F.mul(temp, F.div(points[j][0], F.sub(points[j][0], points[i][0])));
    }
    result = F.add(result, F.mul(points[i][1], temp));
  }
  return result;
}

export {
  PRIME,
  F,
  genKeyPair,
  ecdh,
  poseidon,
  genRandomBigInt,
  encrypt,
  decrypt,
  encode,
  decode,
  evaluatePolynomial,
  recoverSecret,
};
