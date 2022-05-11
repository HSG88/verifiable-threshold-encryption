pragma circom 2.0.3;
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";


template EncryptShare() {
  signal input share;
  signal input privateKey;
  signal input publicKey[2];
  signal output out;

  component skBits = Num2Bits(253);
  skBits.in <== privateKey;

  // Derive ECDH
  component mulAny = EscalarMulAny(253);
  mulAny.p[0] <== publicKey[0];
  mulAny.p[1] <== publicKey[1];
  for (var i = 0; i < 253; i++) {
      mulAny.e[i] <== skBits.out[i];
  }
  // Encrypt share using OTP
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== mulAny.out[0];
  poseidon.inputs[1] <== mulAny.out[1];
  out <== share + poseidon.out;
}