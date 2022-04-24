pragma circom 2.0.3;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template Commitment() {
  signal input value;
  signal input random;
  signal output commitment;

  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== value;
  poseidon.inputs[1] <== random;
  commitment <== poseidon.out;
}