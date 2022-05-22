/* eslint-disable no-plusplus */
import { expect } from 'chai';
import { Point } from '../src/types';
import {
  decode, decrypt, encode, encrypt, evaluatePolynomial, genRandomBigInt, recoverSecret,
} from '../src/utils';

describe('Utils', () => {
  it('Should encode/decode correctly', async () => {
    const array = new Uint8Array(62);
    for (let i = 0; i < array.length; i++) {
      array[i] = i;
    }
    const buf1 = Buffer.from(array);
    const ints = encode(buf1);
    const buf2 = decode(ints);
    expect(buf1).to.eql(buf2);
  });

  it('Should encrypt/decrypt correctly', async () => {
    const array = new Uint8Array(31);
    for (let i = 0; i < array.length; i++) {
      array[i] = i;
    }
    const buf1 = Buffer.from(array);
    const message = encode(buf1);
    const key = genRandomBigInt();
    const ciphertext = encrypt(key, message);
    const decrypted = decrypt(key, ciphertext);
    const buf2 = decode(decrypted);

    expect(buf1).eql(buf2);
  });

  it('Should evaluate polynomial correctly', async () => {
    const testCases = [[1n, 25n]];
    const coefficients = [5n, 10n, 0n, 2n, 8n];
    for (let i = 0; i < testCases.length; i++) {
      expect(evaluatePolynomial(coefficients, testCases[i][0])).eq(testCases[i][1]);
    }
  });

  it('Should recover secret from points', async () => {
    const threshold = 2;
    const n = 2;
    // Generate polynomial
    const coefficients: bigint[] = [];
    for (let i = 0; i < threshold; i++) {
      coefficients.push(genRandomBigInt());
    }
    // Compute n points
    const points:Point[] = [];
    for (let i = 0; i < n; i++) {
      const x = BigInt(i + 1);
      points.push([x, evaluatePolynomial(coefficients, x)]);
    }
    // Select t points and recover the secret coefficients[0]
    expect(coefficients[0]).to.eq(recoverSecret(points.slice(0, threshold)));
  });
});
