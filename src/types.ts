export type Scalar = bigint
export type Point = [bigint, bigint]
export interface KeyPair {
  privateKey: Scalar, // x
  publicKey: Point // Y = xG
}
