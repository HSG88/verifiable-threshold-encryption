pragma circom 2.0.3;
include "./encrypt.circom";
include "./commitment.circom";
include "./polynomial.circom";

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
    encrypt.message[i] <== message[i]; // 31 bytes
    encrypt.ciphertext[i] <== ciphertext[i];
  }

  component polynomial = Polynomial(NUM_OF_COEFFICIENTS, NUM_OF_SHARES);
  for(var i = 0; i < NUM_OF_COEFFICIENTS; i++) {
    polynomial.coefficients[i] <== coefficients[i];
  }
  // x=1, y= , x =2, y, .. 
  component commits[NUM_OF_SHARES];
  for(var i = 0; i < NUM_OF_SHARES; i++) {
    polynomial.shares[i] <== shares[i];
    commits[i] = Commitment();
    commits[i].value <== shares[i];
    commits[i].random <== random[i];
    commits[i].commitment === commitments[i];
  }
}
