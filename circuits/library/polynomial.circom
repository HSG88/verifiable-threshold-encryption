pragma circom 2.0.3;

template Powers(EXPONENT) {
  signal input x;
  signal output out[EXPONENT];

  out[0] <== 1;
  for(var i = 1; i < EXPONENT; i++) {
    out[i] <== out[i-1] * x;
  }
}

template Polynomial(NUM_OF_COEFFICIENTS, NUM_OF_SHARES) {
  assert(NUM_OF_COEFFICIENTS <= 11);
  assert(NUM_OF_SHARES <= 11);
  // coefficient[0] is the secret
  signal input coefficients[NUM_OF_COEFFICIENTS];
  // a secret share is (i+1, share[i])
  signal input shares[NUM_OF_SHARES];
  var powers[10][11] = [ 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
    [1, 3, 9, 27, 81,  243, 729, 2187, 6561, 19683, 59049],
    [1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144, 1048576],
    [1, 5, 25, 125, 625, 3125, 15625, 78125, 390625, 1953125, 9765625],
    [1, 6, 36, 216, 1296, 7776, 46656, 279936, 1679616, 10077696, 60466176],
    [1, 7, 49, 343, 2401, 16807, 117649, 823543, 5764801, 40353607, 282475249],
    [1, 8, 64, 512, 4096, 32768, 262144, 2097152, 16777216, 134217728, 1073741824],
    [1, 9, 81, 729, 6561, 59049, 531441, 4782969, 43046721, 387420489, 3486784401],
    [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 1000000000, 10000000000, 100000000000]
  ];
  var temp[NUM_OF_SHARES];
  for(var i = 0; i < NUM_OF_SHARES; i++) {
    temp[i] = 0;
    for(var j = 0; j < NUM_OF_COEFFICIENTS; j++) {
      temp[i] = temp[i] + (coefficients[j] * powers[i][j]);
      // log(temp[i]);
      // log(powers[i+1][j]);
      // log(coefficients[j]);
    }
  }

  for(var i=0; i<NUM_OF_SHARES; i++) {
    shares[i] === temp[i];
  }
}
