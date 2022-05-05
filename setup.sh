#! /bin/sh

if [ -d ./build ]; then
    rm -rf ./build/*.r1cs
    rm -rf ./build/*.zkey
else
  mkdir build
fi

cd build
POT=../../../pot20.ptau

echo "Compiling circuits"
for FILE in ../circuits/*.circom; 
do 
  circom $FILE --r1cs
done

echo "Generating initial zkeys"
for FILE in ./*.r1cs; 
do 
  ZKEY="${FILE%.*}.zkey"
  VKEY="${FILE%.*}.vkey.json"

 snarkjs g16s $FILE $POT $ZKEY
snarkjs zkev $ZKEY $VKEY
done

echo "Done!"