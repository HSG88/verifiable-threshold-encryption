pragma circom 2.0.3;
include "../../node_modules/circomlib/circuits/poseidon.circom";

template Encrypt(MESSAGE_SIZE) {
  signal input key;
  signal input iv;
  signal input message[MESSAGE_SIZE];
  signal input ciphertext[MESSAGE_SIZE];

  component blocks[MESSAGE_SIZE];

  blocks[0] = Poseidon(2);
  blocks[0].inputs[0] <== key;
  blocks[0].inputs[1] <== iv;
  ciphertext[0] === blocks[0].out + message[0];

  for(var i=1; i<MESSAGE_SIZE; i++) {
    blocks[i] = Poseidon(2);
    blocks[i].inputs[0] <== key;
    blocks[i].inputs[1] <== ciphertext[i-1];
    ciphertext[i] === message[i] + blocks[i].out;
  }
}