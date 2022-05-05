/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import {
  encode, encrypt, evaluatePolynomial, genRandomBigInt, poseidonCommitment,
} from '../src/utils';

const tester = require('circom_tester').wasm;

describe('Circuits', async () => {
  it('Should ensure the correctness of polynomial evaluation', async () => {
    const circuit = await tester(
      './circuits/test/polynomial.test.circom',
      { reduceConstraints: false },
    );

    const sharesNumber = 5;
    const coefficients = [
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
    ];
    const shares = [];
    for (let i = 0; i < sharesNumber; i++) {
      const x = BigInt(i + 1);
      shares.push(evaluatePolynomial(coefficients, x));
    }

    const inputs = {
      coefficients,
      shares,
    };

    const witness = await circuit.calculateWitness(inputs);
    await circuit.checkConstraints(witness);
  });

  it('Should ensure the correctness of commitments', async () => {
    const circuit = await tester(
      './circuits/test/commitment.test.circom',
      { reduceConstraints: false },
    );

    const value = genRandomBigInt();
    const random = genRandomBigInt();
    const commitment = poseidonCommitment(value, random);
    const inputs = {
      value,
      random,
    };

    const witness = await circuit.calculateWitness(inputs);
    await circuit.checkConstraints(witness);
    await circuit.assertOut(witness, { commitment });
  });
  it('Should ensure the correctness of symmetric encryption', async () => {
    const circuit = await tester(
      './circuits/test/encrypt.test.circom',
      { reduceConstraints: false },
    );
    const array = new Uint8Array(31 * 34); // almost 1-Kbytes of data
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.ceil(Math.random() * 1000);
    }
    const buf1 = Buffer.from(array);
    const message = encode(buf1);
    const key = genRandomBigInt();
    const { ciphertext, iv } = encrypt(key, message);

    const inputs = {
      key,
      iv,
      message,
      ciphertext,
    };

    const witness = await circuit.calculateWitness(inputs);
    await circuit.checkConstraints(witness);
  });
  it('Should ensure the correctness of verifiable threshold encryption', async () => {
    const circuit = await tester(
      './circuits/main_1kb.circom',
      { reduceConstraints: false },
    );
    const array = new Uint8Array(31 * 34); // almost 1-Kbytes of data
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.ceil(Math.random() * 1000);
    }
    const buf1 = Buffer.from(array);
    const message = encode(buf1);
    const sharesNumber = 10;
    const coefficients = [
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
      genRandomBigInt(),
    ];
    const cipher = encrypt(coefficients[0], message);
    const shares = [];
    const commitments = [];
    const random = [];
    for (let i = 0; i < sharesNumber; i++) {
      const x = BigInt(i + 1);
      shares.push(evaluatePolynomial(coefficients, x));
      random.push(genRandomBigInt());
      commitments.push(poseidonCommitment(shares[i], random[i]));
    }
    const { ciphertext, iv } = cipher;

    const inputs = {
      coefficients,
      shares,
      iv,
      message,
      ciphertext,
      random,
      commitments,
    };

    const witness = await circuit.calculateWitness(inputs);
    await circuit.checkConstraints(witness);
  });
});
