echo ""
echo "Filter packages on packagedBy Ruben"
echo ""

eye --quiet --nope data/* logic/filter-package/* > intermediate/run1.n3

cat intermediate/run1.n3

echo ""
echo "Flatten resulting data"
echo ""

eye --quiet --nope --no-qnames intermediate/run1.n3 logic/flatten/* > intermediate/result.n3

cat intermediate/result.n3

