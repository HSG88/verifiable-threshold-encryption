pragma circom 2.0.3;
include "./library/encryption.circom";

component main{public [keyHash, ciphertext, iv]} = Encryption(34*4);