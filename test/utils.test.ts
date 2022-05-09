/* eslint-disable no-plusplus */
import { expect } from 'chai';
import {
  decode, decrypt, encode, encrypt, evaluatePolynomial, genRandomBigInt,
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

  it.only('Should encrypt/decrypt correctly', async () => {
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
});
