/* eslint-disable no-plusplus */
import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import { KeyPair, Point } from '../src/types';
import {
  decode,
  decrypt,
  ecdh, encode, encrypt, evaluatePolynomial, F, genKeyPair,
  genRandomBigInt, poseidon, recoverSecret,
} from '../src/utils';

const fs = require('fs');
const crypto = require('crypto');

describe('Example', () => {
  it('Should verifiably secret share a key, encrypt a message, reconstruct the key and decrypt the ciphertext', async () => {
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

    const keySharingProof = await groth16.fullProve(
      polynomialInput,
      polynomialArtifacts.wasm,
      polynomialArtifacts.zkey,
    );

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

    const encryptionProof = await groth16.fullProve(
      encryptionInput,
      encryptionArtifacts.wasm,
      encryptionArtifacts.zkey,
    );

    expect(await groth16.verify(
      encryptionArtifacts.vkey,
      encryptionProof.publicSignals,
      encryptionProof.proof,
    ));

    // 8. Decrypt t shares by the corresponding share holder private key
    const points: Point[] = [];
    for (let i = 0; i < threshold; i++) {
    // Derive shared key between the dealer and holder i
      const symmetricKey = ecdh(holders[i].privateKey, dealerKeys.publicKey);
      // Encrypt share using Poseidon OTP
      points.push([BigInt(i + 1), F.sub(encryptedShares[i], symmetricKey)]);
    }

    // 9. Recover shared key
    const recoveredKey = recoverSecret(points);
    expect(recoveredKey).to.eq(key);

    // 10. Decrypt ciphertext
    const decrypted = decrypt(key, { ciphertext, iv });
    const decoded = decode(decrypted);
    expect(decoded).to.eql(data);
  });
});
