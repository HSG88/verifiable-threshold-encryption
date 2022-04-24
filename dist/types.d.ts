export declare type Scalar = bigint;
export declare type Point = [bigint, bigint];
export interface KeyPair {
    privateKey: Scalar;
    publicKey: Point;
}
