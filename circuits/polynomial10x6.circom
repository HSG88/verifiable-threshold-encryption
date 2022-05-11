pragma circom 2.0.3;
include "./library/polynomial.circom";

component main{public [keyHash, encryptedShares, publicKeys]} = Polynomial(6, 10);