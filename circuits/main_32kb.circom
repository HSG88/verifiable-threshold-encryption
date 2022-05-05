pragma circom 2.0.3;
include "./library/main.circom";

// Encrypt 31 bytes x 34 x 32 = 32kb
// Coefficients = 6
// Shares = 10
component main{public [ciphertext, commitments]} = VerifiableThreshold(34*32, 6, 10);