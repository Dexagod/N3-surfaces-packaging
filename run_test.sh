#!/bin/bash

echo ""
echo "Move input data to onDataSurface"
echo ""


FILES="./test/data/*"
for f in $FILES
do
  echo "Processing $f file..."
  # take action on each file. $f store current file name
  node software/move-to-surface.js $f -s onDataSurface > ./test/data_processed/$(basename $f)
done

echo ""
echo "Filter packages on packagedBy Ruben"
echo ""

eye --quiet --nope ./test/data_processed/* ./test/logic/filter-package/* > ./test/intermediate/run1.n3

cat ./test/intermediate/run1.n3

echo ""
echo "Move input data to onDataSurface"
echo ""

node software/move-to-surface.js ./test/intermediate/run1.n3 -s onDataSurface > ./test/intermediate/run1_processed.n3

echo ""
echo "Flatten packages"
echo ""

eye --quiet --nope --no-qnames ./test/intermediate/run1_processed.n3 ./test/logic/flatten/* > ./test/intermediate/result.n3

cat ./test/intermediate/result.n3

