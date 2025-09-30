/** Diving into TypeScript — Exercises 
 * Follow the instructions on how to create and run a new project:
 * https://github.com/hogeschool/INFWAD/tree/main/Week1.4
 * Copy this file into your project and try to solve the exercises below.
 */ 



// 0. Run the code below and see your output:
// Check your /dist or /outdir folder and check out the generated files
console.log("Welcome to practicing TypeScript!");



/** 1. Variables & Primitive Types 
 * Declare a number, string, boolean, null, and undefined
 * Create a const object and try mutating its properties
 */
// const myObject = {...}



/** 2. Basic Type Checking
 * return the length of the value if it's type string, 
 * return the number of digits if the type of value is number
 */
function getLength(value: (string | number)): number {
    if (typeof value === "string") {

    } else {

    }
    return 0;
}
getLength(55);


/** 3. If statement
 * return "Adult" if age is over 18 or 
 * return the age if the age is under 18
 */
type ageOrName = (string | number);
function isAdult(age: number): ageOrName {
    return "Adult";
}
isAdult(19); // returns "Adult"
isAdult(7); // returns 7



type myType = {} // Complete myType
/** 4. Function call with optional parameter
 * greetOrIntroduce parameter is special
 */
function greet(name: string, greetOrIntroduce?: myType): string {
  // code here
  return "";
}
greet("Alice", "hello"); // returns "hello, my name is Alice"
greet("Alice"); // returns "my name is Alice"
greet("Alice", {
    age: 12, 
    surname: "wonderland", 
    school: "hr"
}) // returns "hello, my name is Alice. My surname is wonderland, I'm 12 years old, and I go to HR".



/** 6. Scope
 * Redefine another variable x within the scope
 */
let x = 10;
function testScope() {
    // code here
    console.log(x); // should print ??
}



/** 7. Lambda Functions
 * Write an arrow function square(n: number): number
 * The function should returns the square of the number
 */
square(2); // returns 4
square(3); // returns 9



/** 8. Higher Order Functions
 * Apply fn to alter the number however you want
 */ 
function apply(fn: (num: number) => number, value: number): number {
    // code here
    return -1;
}
apply(function add(x) {return x+1}, 5); // returns 6
apply(function multiply(x) {return x*5}, 6); // returns 30



/**
 * 9. Generic functions
 * Write a function that it takes an array where the element types of the arrays are unknown
 * And gets the first element of an array and returns
 */
// function getFirstElement(array: ...[]) {...}



/**
 * 10. Write a generic higher-order function that takes an array and a mapper function
 * Applies the mapper function to the array
 * Pay attention to the types of the array and the mapper function passed as a parameter
 */
// function mapArray<..., ....>(arr: T[], ...): ... {}
const nums = [1, 2, 3, 4];
const doubled = mapArray<number, number>(nums, n => n * 2);     // number[]
const stringified = mapArray(nums, n => `number-${n}`);         // string[]
console.log(doubled);      // [2, 4, 6, 8]
console.log(stringified);  // [number-1, number-2, number-3, number-4]



// 10. Map
const names = ["alice", "bob", "charlie"];
// TODO: Use .map() to capitalize only first letters



// 11. Filter
const numbers = [10, 15, 20, 25, 30];
// TODO: Use .filter() to get even numbers



/**  12. Reduce / Fold
 * documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 * Use .reduce() to flatten an array
 * Note: Please provide an initialValue to the reduce function
 */
// const arr = [1, 2, 3, 4, 5];




/**  13. Reduce / Fold
 * documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 * Use .reduce() to compute sum of the array
 * Do provide an initialValue to the reduce function (hint: should be empty an array)
 */
const arr = [[1, 2], [3, 4], [5]];  // returns [1, 2, 3, 4, 5]
// const initialValue = 0;
// arr.reduce((accumulator, currentValue) => ..., ...)


/** 14. Implement factorial calculation with loop
 * Calculate the factorial of a number with whatever loop you'd like
 */ 
function factorialLoop(n: number): number {
    let result = 1;
    // code here
    return 0;
}
factorialLoop(5); // 120
factorialLoop(4); // 24



/** 15. Recursion instead of loops
 * Implement recursive factorial
 */ 
function factorialRec(n: number): number {
    if (n <= 2) return n; // base case to stop the recursion
    return 0;
}
factorialLoop(5); // 120
factorialLoop(4); // 24



/**
 * 16. Bonus: Calculate fibonacci with loop or recursion
 */
function fibonacci(n: number): number {
    return n;
}


// Bonus: Documentation for Utility types in TypeScript: https://www.typescriptlang.org/docs/handbook/utility-types.html