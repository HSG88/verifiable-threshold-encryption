pragma circom 2.0.3;
include "./library/encrypt.circom";
include "./library/commitment.circom";
include "./library/polynomial.circom";

template VerifiableThreshold(MESSAGE_SIZE, NUM_OF_COEFFICIENTS, NUM_OF_SHARES) {
  signal input coefficients[NUM_OF_COEFFICIENTS];
  signal input shares[NUM_OF_SHARES];
  signal input random[NUM_OF_SHARES];
  signal input iv;
  signal input message[MESSAGE_SIZE];
  signal input ciphertext[MESSAGE_SIZE];
  signal input commitments[NUM_OF_SHARES];

  component encrypt = Encrypt(MESSAGE_SIZE);
  encrypt.key <== coefficients[0];
  encrypt.iv <== iv;
  for(var i = 0; i < MESSAGE_SIZE; i++) {
    encrypt.message[i] <== message[i];
    encrypt.ciphertext[i] <== ciphertext[i];
  }

  component polynomial = Polynomial(NUM_OF_COEFFICIENTS, NUM_OF_SHARES);
  for(var i = 0; i < NUM_OF_COEFFICIENTS; i++) {
    polynomial.coefficients[i] <== coefficients[i];
  }

  component commits[NUM_OF_SHARES];
  for(var i = 0; i < NUM_OF_SHARES; i++) {
    polynomial.shares[i] <== shares[i];
    commits[i] = Commitment();
    commits[i].value <== shares[i];
    commits[i].random <== random[i];
    commits[i].commitment === commitments[i];
  }
}
// Encrypt 31 bytes x 34 = 1054 bytes
// Coefficients = 6
// Shares = 10
component main{public [ciphertext, commitments]} = VerifiableThreshold(34, 6, 10);
