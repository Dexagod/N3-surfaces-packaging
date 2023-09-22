#!/bin/bash

echo ""
echo "Move input data to onDataSurface"
echo ""


FILES="./data/*"
for f in $FILES
do
  echo "Processing $f file..."
  # take action on each file. $f store current file name
  node ./software/move-to-surface/bin/move-to-surface.js $f -s onDataSurface > ./data_processed/$(basename $f)
done

echo ""
echo "Filter packages on packagedBy Ruben"
echo ""

eye --quiet --nope ./data_processed/* ./logic/filter-package/* > ./intermediate/run1.n3

cat intermediate/run1.n3

echo ""
echo "Move input data to onDataSurface"
echo ""

node ./software/move-to-surface/bin/move-to-surface.js ./intermediate/run1.n3 -s onDataSurface > ./intermediate/run1_processed.n3

echo ""
echo "Flatten packages"
echo ""

eye --quiet --nope --no-qnames ./intermediate/run1_processed.n3 ./logic/flatten/* > ./intermediate/result.n3

cat ./intermediate/result.n3

