// Test file for name permutation logic

// Simulating the name permutation function from the main component
function generateNamePermutations(names: Array<{firstName: string, lastName: string}>) {
  if (names.length < 2) return [];
  
  const firstNames = names.map(n => n.firstName);
  const lastNames = names.map(n => n.lastName);
  const permutations: string[] = [];
  
  // Generate all possible combinations including original names
  firstNames.forEach(fn => {
    lastNames.forEach(ln => {
      permutations.push(`${fn} ${ln}`);
    });
  });
  
  // Return permutations (without shuffle for deterministic testing)
  return permutations;
}

// Create test data
const testNames = [
  { firstName: "Emma", lastName: "Watson" },
  { firstName: "Claire", lastName: "Boucher" },
  { firstName: "Zara", lastName: "Tatiana" }
];

// Expected permutations (including same first/last name combinations)
const expectedPermutations = [
  "Emma Watson",   // original
  "Emma Boucher",  // mixed
  "Emma Tatiana",  // mixed
  "Claire Watson", // mixed
  "Claire Boucher", // original
  "Claire Tatiana", // mixed
  "Zara Watson",   // mixed
  "Zara Boucher",  // mixed
  "Zara Tatiana"   // original
];

// Run the test
const generatedPermutations = generateNamePermutations(testNames);

// Print results
console.log("Generated permutations:", generatedPermutations);
console.log("Expected permutations:", expectedPermutations);

// Check if all expected permutations are present (regardless of order)
const allFound = expectedPermutations.every(expected => 
  generatedPermutations.includes(expected)
);

// Check if counts match
const correctCount = generatedPermutations.length === expectedPermutations.length;

console.log("All expected permutations found:", allFound);
console.log("Correct number of permutations:", correctCount);
console.log("Test passed:", allFound && correctCount);

// Test the function with a smaller set
const smallTestNames = [
  { firstName: "Emma", lastName: "Watson" },
  { firstName: "Claire", lastName: "Boucher" }
];

const smallExpectedPermutations = [
  "Emma Watson",  // original
  "Emma Boucher", // mixed
  "Claire Watson", // mixed
  "Claire Boucher" // original
];

const smallGeneratedPermutations = generateNamePermutations(smallTestNames);
console.log("\nSmall test generated permutations:", smallGeneratedPermutations);
console.log("Small test expected permutations:", smallExpectedPermutations);

const smallAllFound = smallExpectedPermutations.every(expected => 
  smallGeneratedPermutations.includes(expected)
);
const smallCorrectCount = smallGeneratedPermutations.length === smallExpectedPermutations.length;

console.log("Small test all expected permutations found:", smallAllFound);
console.log("Small test correct number of permutations:", smallCorrectCount);
console.log("Small test passed:", smallAllFound && smallCorrectCount); 