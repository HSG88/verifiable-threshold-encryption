pragma circom 2.0.3;
include "../../node_modules/circomlib/circuits/mimc.circom";

template Encrypt(MESSAGE_SIZE) {
  signal input key;
  signal input iv;
  signal input message[MESSAGE_SIZE];
  signal input ciphertext[MESSAGE_SIZE];

  component mimc[MESSAGE_SIZE];
  for(var i=0; i<MESSAGE_SIZE; i++) {
    mimc[i] = MiMC7(91);
    mimc[i].x_in <== iv + i;
    mimc[i].k <== key;
    ciphertext[i] === message[i] + mimc[i].out;
  }
}