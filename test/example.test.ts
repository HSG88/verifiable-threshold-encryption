/* eslint-disable no-plusplus */
import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import { KeyPair } from '../src/types';
import {
  ecdh, encode, encrypt, evaluatePolynomial, F, genKeyPair,
  genRandomBigInt, poseidon,
} from '../src/utils';

const fs = require('fs');
const crypto = require('crypto');

describe('Example', () => {
  it.only('Should verifiably secret share a key and encrypt a message', async () => {
  // 0. Create key-pair for the dealer
    const dealerKeys = genKeyPair();

    // 1. Generate polynomial coefficients
    const threshold = 6;
    const coefficients: bigint[] = [];
    for (let i = 0; i < threshold; i++) {
      coefficients.push(genRandomBigInt());
    }

    // 2. Compute shares
    const sharesCount = 10;
    const shares: bigint[] = [];
    for (let i = 0; i < sharesCount; i++) {
      const x = BigInt(i + 1);
      shares.push(evaluatePolynomial(coefficients, x));
    }

    // 3. Create key pair for each share holder
    // In practice, the dealer receives public keys of shares holders
    const holders: KeyPair[] = [];
    for (let i = 0; i < sharesCount; i++) {
      holders.push(genKeyPair());
    }

    // 4. Encrypt each share by the corresponding share holder public key
    const encryptedShares: bigint[] = [];
    for (let i = 0; i < sharesCount; i++) {
    // Derive shared key between the dealer and holder i
      const symmetricKey = ecdh(dealerKeys.privateKey, holders[i].publicKey);
      // Encrypt share using Poseidon OTP
      encryptedShares.push(F.add(shares[i], symmetricKey));
    }

    // 5. Generate proof for verifiable key sharing
    const key = coefficients[0];
    const keyHash = poseidon([key]);
    const polynomialArtifacts = {
      zkey: fs.readFileSync('./build/polynomial10x6.zkey'),
      wasm: fs.readFileSync('./build/polynomial10x6.wasm'),
      vkey: JSON.parse(fs.readFileSync('./build/polynomial10x6.vkey')),
    };

    const polynomialInput = {
      keyHash,
      encryptedShares,
      publicKeys: holders.map((el) => el.publicKey),
      coefficients,
      privateKey: dealerKeys.privateKey,
    };

    console.time('Key sharing proof generation');
    const keySharingProof = await groth16.fullProve(
      polynomialInput,
      polynomialArtifacts.wasm,
      polynomialArtifacts.zkey,
    );
    console.timeEnd('Key sharing proof generation');

    expect(await groth16.verify(
      polynomialArtifacts.vkey,
      keySharingProof.publicSignals,
      keySharingProof.proof,
    ));

    // 6. Encrypt data
    const size = 1054;
    const data = crypto.randomBytes(size);
    // Encode data into set of signals
    const encodedData = encode(data);
    // Encrypt encoded data
    const { ciphertext, iv } = encrypt(key, encodedData);

    // 7. Generate proof for verifiable encryption
    const encryptionArtifacts = {
      zkey: fs.readFileSync('./build/encryption_1kb.zkey'),
      wasm: fs.readFileSync('./build/encryption_1kb.wasm'),
      vkey: JSON.parse(fs.readFileSync('./build/encryption_1kb.vkey')),
    };

    const encryptionInput = {
      keyHash,
      ciphertext,
      iv,
      key,
      message: encodedData,
    };

    console.time('Verifiable encryption proof generation');
    const encryptionProof = await groth16.fullProve(
      encryptionInput,
      encryptionArtifacts.wasm,
      encryptionArtifacts.zkey,
    );
    console.timeEnd('Verifiable encryption proof generation');

    expect(await groth16.verify(
      encryptionArtifacts.vkey,
      encryptionProof.publicSignals,
      encryptionProof.proof,
    ));
  });
});
