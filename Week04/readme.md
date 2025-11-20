# Lecture notes: 1.4 - TypeScript

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Introduction to TS
TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- **JavaScript and a lot More** : TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor. Catch errors early in your editor.
- **Runs as Javascript** : TypeScript code compiles to JavaScript, which runs anywhere JavaScript runs: In a browser, on Node.js, Deno, Bun and in your apps.
- **Required Tools** : Something to install the TypeScript compiler with (for example, Node.JS and npm).


### 1.1 Installation

If you are a beginner, start with `npm` instead of the newer package managers.

- Follow instructions for installing Node.js + npm here:

  https://nodejs.org/en/download/current

  (Select `nvm + npm`, or `Volta + npm`)

  (You might have to uninstall your current Node.js version first)

### 1.2 TypeScript reference
- https://www.typescriptlang.org


### 1.3 Creating your project
- Open a folder in VSCode (we will use VSCode, you may choose whichever tool you fancy)
- Create a new project with `npm init` (Will generate a package.json file)
- Add TS with `npm install typescript -D` -D because we want to include the TS compiler as a development utility but do not want any traces of it in the resulting compiled JavaScript
- You might also need 
  - `npm install -D ts-node @types/node`
- Add the TS config file with `tsc -init`

- **Update the tsconfig.json file.** Make sure it has these settings:
  ```json
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "target": "esnext",
    "noImplicitAny": true,  
  ```
- **Write, Compile, Run & Debug**
  - Create folder `src`
  - Create file `src/first.ts` with this in it:
  ```ts
  console.log("Welcome to TS")
  ```
  - **compilation** with `tsc -w` -w is for watch mode  this will create first.js in outDir
  - **run** (in 2nd terminal) `node dist/first.js` 
  - **transpile** (compile and run in one go) `npx ts-node src/first.ts`
  - **debug**
    Create `launch.json` (in folder `.vscode`) for debugging:

  ```json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Debug Compiled from dist",
        "program": "${workspaceFolder}/dist/src/${fileBasenameNoExtension}.js",
        "outFiles": ["${workspaceFolder}/dist/src/*.js"],
        "sourceMaps": true,
        "cwd": "${workspaceFolder}",
        "console": "integratedTerminal"
      }
    ]
  }
  ```
  You can now use the Run and Debug tab in VSCode.
  
### 1.4 Testing

1. Install compatible Jest version
`npm install -D jest ts-jest @types/jest`

2. Initialize Jest config
`npx ts-jest config:init`

3. Writing code to test and test cases

    (You might need to modify tsconfig: `"verbatimModuleSyntax": false`)

    a. Write code in e.g. **src\demo.ts**
    ```ts
    export function sum(a: number, b: number): number {
      return a + b;
    }
    ```
      b. Create Test in tests\demo.test.ts
    ```ts
    import { sum } from "../src/demo";

    test("adds two numbers", () => {
      expect(sum(2, 3)).toBe(5);
    });

    test("works with negatives", () => {
      expect(sum(-1, -1)).toBe(-2);
    });
    ```

4. Run tests with: `npx jest`
5. Update your `package.json`:

    ```json
      "scripts": {
        "test": "jest",
        "test:watch": "jest --watch"
      },
    ```
6. Run tests with: `npm run test`

Reference (optional reading):
https://jestjs.io/docs/getting-started#using-typescript


## 2. The Basics
https://www.typescriptlang.org/docs/handbook/2/basic-types.html

We will discuss:
- Hello TS example
- Data types and type inference
- Variables (let and const)
- Operations
- Arrays
- Functions

### 2.1 Hello TS
```ts
console.log(`Welcome to TS`)
console.log(`The result of 3+3*3/2 is ${3+3*3/2}`)
console.log(`Is 3/2=1.5 or 1 ? it is ${3n/2n}`)
console.log(`3n/2n=${3/2}`)
console.log(`Unlike javascript 3!='3' or "3", but 3==3 and '3'==="3" ${'3'==="3" && 3==3}`)
```
Output:
```
Welcome to TS
The result of 3+3*3/2 is 7.5
Is 3/2=1.5 or 1 ? it is 1
3n/2n=1.5
Unlike javascript 3!='3' or "3", but 3==3 and '3'==="3" true
```

### 2.2 Types
https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
https://www.typescriptlang.org/docs/handbook/variable-declarations.html

- The primitives: string, number, and boolean;

Typescript, like JavaScript, has these three very commonly used primitives. 
The type names String, Number, and Boolean (starting with capital letters) are legal, but refer to some special built-in types that will very rarely appear in your code. Always use `string`, `number`, or `boolean` for types.

- Implicit any and explicit any:

TypeScript also has a special type, `any`, that you can use whenever you don’t want a particular value to cause typechecking errors. *We will not use `any` anywhere*

### 2.3 `let` and `const` and `var` (never use var, though!).

`const` is an special version of `let`, in that it prevents re-assignment to a variable. All declarations other than those you plan to modify should use `const`.

  ```ts
  let x = 10
  const y = "hello world"

  x = 11
  y = "A new string" //Will not work! Cannot assign to 'y', because it is a constant
  ```
  
  The names introduced by `let` and `const` are only available within the block (delimited by `{` and `}`) in which they are declared. This is called ***scope***, and is considered the standard behaviour in modern programming languages:

  ```ts
  const x = 100
  console.log(x)
  {
    let x = "hello world!"
    console.log(x)
  }
  console.log(x)
  ```
 The above code will print:

  ```sh
  100
  hello world!
  100
  ```
### 2.4 Operations

  In TypeScript all numbers are `double` precision floating points (64 bits). In some cases we might use `bigint`. Below you can see an example of different operations on numbers:

  ```ts
  let i = 3 //  i and j are of type number
  let j:number = 2
  console.log(i + j, i * j, i / j, i % j ,i ** j)

  let k:bigint = 3n
  let l = 2n
  console.log(k + l, k * l, k / l, k % l ,k ** l)
  ```

### 2.5 Arrays

  In order to declare more than one value, typescript allows you to declare arrays. The general syntax is `datatype[]` or `Array<datatype>`.
  
For example:
```ts
const names = ["Alice", 'Bob', `Charlie`]
names.push("Diana")

console.log(names)

let grades:number[] = [7.5, 9, 0, 10]
let Status = Array<boolean>(4)

Status[0] = grades[0]!>5.5

```

### 2.6 Functions

Functions are the basic building block of any application, whether they’re local functions, imported from another module, or methods on a class. They’re also values, and just like other values, TypeScript has many ways to describe how functions can be called. Let’s learn about how to write types that describe functions.

#### Named functions
```ts
function Add(a:number, b:number) {
  return a + b;
}
```
```ts
// Or when you add the return type of the function itself as well:
function Add(a:number, b:number): number {
  return a + b;
}
```
#### Anonymous functions
```ts
const Add = function(a:number, b:number) {
  return a + b;
}
```
```ts
// Or when you add the return type of the function itself as well:
const Add = function(a:number, b:number):number {
  return a + b;
}
```

#### Lambda / 'fat arrow' function notations
Another way of writing anonymous functions is the lambda function. Using the fat arrow `=>`, we dropped the need to use the function keyword.

(Do not confuse it with the `>=` and `<=` operators (Greater than or equal / Less than or equal) when reading code!)
```ts
// When you write it this way, the 'return' is implied:
const Add = (a:number, b:number):number => a + b;
```
```ts
// Or with curly brackets (needs explicit 'return'):
const Add = (a:number, b:number):number => {
  return a + b;
}
```

You can move the type definition of the function to the front as well:

```ts
const Add:(a:number,b:number)=>number = (a, b) => a + b;
```
```ts
// With curly brackets:
const Add:(a:number,b:number)=>number = (a, b) => {
  // Space for more code here
  return a + b;
}
```

For more a more in-depth explanation with lots of examples, when you want to know more or are running into specific problems when you're working on your project, read this:
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

### 2.7 Diving deeper

Let us explore TypeScript further with one example.

Imagine you need to write a function to add an array of numbers (calculate the total by adding all the values together), let us call this AddAll.

```ts
function AddAll(arr:Array<number>):number{
  let result=0;

  for(let i=0; i<arr.length; i++){
    result += arr[i]!;
  }

  return result;
}
```
Instead of AddAll, what changes will it need to make it multiply all (calculate the total by multiplying all the values)?

The two changes required are instead of summing up `result += arr[i]!;`, multiply `result *= arr[i]!;` and one more change, i.e. start with Mulitiplicative identity `let result=1;` instead of additvie identity `let result=0;`.

Now, what if i need to write a method to find the maximum or minimum value from the array? can we re-write it into a general purpose method to use it for various purposes?

Yes, we can, of course:

```ts
enum operations {add, mul, gt, lt}

function ActionAll(arr:number[], action:operations, initVal:number){
  let result = initVal;

  for(let i=0; i<arr.length; i++){
    switch(action){
      case operations.add:
        result += arr[i]!;
        break;
      case operations.mul:
        result *= arr[i]!;
        break;
      case operations.gt:
        result = result >= (arr[i]!)? result : (arr[i])!; 
        break;
      case operations.lt:
        result = result <= (arr[i]!)? result : (arr[i])!;
        break;
    }
  }
  
  return result;
}

// Example usage
let values:number[] = [1,2,3,4,5]

let sum = ActionAll(values, operations.add, 0)
let product = ActionAll(values, operations.mul, 1)
let max = ActionAll(values, operations.gt, Number.MIN_VALUE)
let min = ActionAll(values, operations.lt, Number.MAX_VALUE)
```

Let's remove the need for supplying an initial value:

```ts
enum operations {add, mul, gt, lt}

function ActionAll(arr:number[], action:operations){
  let result = arr[0];

  for(let i=1; i<arr.length; i++){
    switch(action){
      case operations.add:
        result += arr[i]!;
        break;
      case operations.mul:
        result *= arr[i]!;
        break;
      case operations.gt:
        result = result >= (arr[i]!)? result : (arr[i])!; 
        break;
      case operations.lt:
        result = result <= (arr[i]!)? result : (arr[i])!;
        break;
    }      
  }

  return result;
}
```

We left out any exception handling so it is easier to see the differences between the examples. Here is an example that demonstrates throwing errors:

(For production code, you should write code that prevents and handles these errors in a way that does not bother the user.)

```ts
enum operations {add, mul, gt, lt}

function ActionAll(arr:number[], action:operations){
  if(arr.length<=0) throw new Error("Empty array");
  if(arr[0]==undefined) throw new Error("Empty at index 0");

  let result = arr[0];

  for(let i=1; i<arr.length; i++){
    if(arr[i]==undefined) throw new Error(`Empty at index ${i}` );

    switch(action){
      case operations.add:
        result += arr[i]!;
        break;
      case operations.mul:
        result *= arr[i]!;
        break;
      case operations.gt:
        result = result >= (arr[i]!)? result : (arr[i])!; 
        break;
      case operations.lt:
        result = result <= (arr[i]!)? result : (arr[i])!;
        break;
    }      
  }

  return result;
}
```

For the rest of the code examples, we will keep the error throwing out to make it easier to demonstrate new ways of structuring your code.

#### Control structures

By working on the examples above, we have also practiced with a couple of TypeScript concepts. To summarize:

- if else
- loop
- switch case
- enum
- throwing errors

### 2.8 Lambda expressions and Higher order functions

The above implementations are limited to a given set of operations only. If we want an even more generalized implementation, the operation must be flexible and should be defined later. We can pass it as a function. This way, ActionAll becomes a Higher Order Function.

We will call the input parameter that will contain the operation function: `fx` (instead of `action`):

```ts
function ActionAllHoF(arr:number[], fx:(a:number, c:number):number):number {
  let result = arr[0];

  for(let i=1; i<arr.length; i++){
    result = fx(result, arr[i]!)
  }

  return result;
}

// Example Usage
let values:number[] = [1,2,3,4,5]

let sum = ActionAllHoF(values, (a,b) => a+b)
let product = ActionAllHoF(values, (a,b) => a*b)
let max = ActionAllHoF(values, (a,b) => (a>=b)? a : b)
let min = ActionAllHoF(values, (a,b) => (a<=b)? a : b)
```

So much nicer and cleaner, right? Compare it to the examples above.

Now what if we want to use this `ActionAllHoF` (HoF stands for ***Higher-order-Function***) for any other data types? The most obvious is for example `bigint`, or maybe for string or any other data types?

You understood it right, let's rewrite it using Generics.

### 2.9 Generics

By using generics, we make the type of the values in the array dynamic and dependent on what we pass it. When looking at this for the first time, and comparing with the examples above, imagine that the `T` contains `number`, for example.

```ts
function ActionAllHoFGeneric<T>(arr:Array<T>, fx:(a:T, b:T) => T):T {
  let result = arr[0];

  for(let i=1; i<arr.length; i++){
    result = fx(result, arr[i]);  
  }
  
  return result;
}
```

### 2.10 Curried

What about a curried version?

```ts
function ActionAllHoFGenericCurried<T>(fx:(a:T, b:T) =>T ):T {
  return (arr:Array<T>) => {
    let result = arr[0];

    for(let i=1; i<arr.length; i++){
      result = fx(result, arr[i]);  
    }

    return result;
}
```

### 2.11 Recursion

Let's start with an oversimplified example of recursion: An example to calculate factorial ('faculteit' in het Nederlands).

Explanation of the mathematical principle, for those scratching their heads now:

To calculate the factorial of a number (n!), you multiply the number by every positive integer smaller than it, down to 1. For example, \(4!\) is calculated as 4 x 3 x 2 x 1 = 24. The factorial of 0 (\(0!\)) is defined as 1. (For simplicity the example considers the factorial of numbers smaller than 0 as 1.)

Now that you understand what we want to calculate, let's see the code:

```ts
// If we implement this in an iterative way:
function factorial(n:number):number {
  if (n<=0) return 1;

  let result = 1;

  for(let i=2; i<=n; i++)
    result *= i;

  return result;
}
```
```ts
// If we implement this using recursion:
function factorial(n:number):number {
  if(n<=0) return 1;
  return n * recursion(n-1);
}
```
```ts
// If we implement it recursively in one line as a lambda function:
const factorial = (n: number): number => (n <= 0) ? 1 : n * factorial(n - 1);
```

Now let's use the concept of recursion and use it to keep improving our `ActionAll` example. Sometimes the return type of the function may or may not be the same, so let's also modify the signature and rename it to something like Reduce.

It is based on the curried version. Note that the `for` loop is gone, and it is now calling itself (which is what recursion is).

```ts
function Reduce<T, R>(fx: (acc: R, val: T) => R, initValue: R) {
  return (arr: Array<T>): R => {
    function inner(index: number, acc: R): R {
      if (index >= arr.length) return acc;
      return inner(index + 1, fx(acc, arr[index]!));
    }
    return inner(0, initValue);
  };
}

// Example usage
const nums = [1, 2, 3, 4];
const sum = Reduce<number, number>((a, b) => a + b, 0)(nums);
const product = Reduce<number, number>((a, b) => a * b, 1)(nums);
console.log(sum, product); // 10 24
```

Or even shorter:

```ts
function Reduce<T, R>(fn: (acc: R, cur: T) => R, init: R) {
  return function recur(arr: T[]): R {
    if (arr.length === 0) return init;
    const [head, ...tail] = arr;
    return Reduce(fn, fn(init, head))(tail);
  };
}

// Example usage
const nums = [1, 2, 3, 4];
console.log(Reduce((a, b) => a + b, 0)(nums)); // 10
console.log(Reduce((a, b) => a * b, 1)(nums)); // 24
```

Apart from reduce, other common higher order functions are filter and map:

```ts
// Non curried version:
function MapGeneric<T, R>(arr: Array<T>, fn: (val: T, index: number) => R): Array<R> {
  const result: Array<R> = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i]!, i));
  }
  return result;
}

// Example usage
const squared = MapGeneric([1, 2, 3], (x) => x * x);
console.log(squared); // [1, 4, 9]

// Curried version:
function Map<T, R>(fn: (x: T) => R) {
  return (arr: T[]): R[] => {
    if (arr.length === 0) return [];
    const [head, ...tail] = arr;
    return [fn(head), ...Map(fn)(tail)];
  };
}

// Example usage
const timesTwo = Map((x: number) => x * 2)([1, 2, 3]);
console.log(timesTwo); // [2, 4, 6]
```

```ts
// Non curried version:
function FilterGeneric<T>(arr: Array<T>, pred: (val: T, index: number) => boolean): Array<T> {
  const result: Array<T> = [];
  for (let i = 0; i < arr.length; i++) {
    if (pred(arr[i]!, i)) result.push(arr[i]!);
  }
  return result;
}

// Example usage
const evenNumbers = FilterGeneric([1, 2, 3, 4], (x) => x % 2 === 0);
console.log(evens); // [2, 4]

// Curried version:
function Filter<T>(pred: (x: T) => boolean) {
  return (arr: T[]): T[] => {
    if (arr.length === 0) return [];
    const [head, ...tail] = arr;
    return pred(head) ? [head, ...Filter(pred)(tail)] : Filter(pred)(tail);
  };
}

// Example usage
const evenNumbersB = Filter((x: number) => x % 2 === 0)([1, 2, 3, 4]);
console.log(evenNumbersB); // [2, 4]
```

We may reuse this Reduce pattern to do quite a lot of things, for example reduce can be used to map, and filter as well.

Reusing Reduce to implement Map and Filter:

```ts
// Map using Reduce
function MapWithReduce<T, R>(arr: Array<T>, fn: (val: T, idx: number) => R): Array<R> {
  return arr.reduce<Array<R>>((acc, val, idx) => {
    acc.push(fn(val, idx));
    return acc;
  }, []);
}

// Filter using Reduce
function FilterWithReduce<T>(arr: Array<T>, pred: (val: T, idx: number) => boolean): Array<T> {
  return arr.reduce<Array<T>>((acc, val, idx) => {
    if (pred(val, idx)) acc.push(val);
    return acc;
  }, []);
}
```

TypeScript provides built-in implementations of `map`, `reduce`, and `filter`:

```ts
const arr = [1, 2, 3, 4, 5];
console.log(arr.map(x => x * 2));       // Map
console.log(arr.filter(x => x % 2));    // Filter
console.log(arr.reduce((a, b) => a + b, 0)); // Reduce
```

The point of teaching map, reduce, and filter in this lesson was to introduce language constructs and problem-solving approaches: how to approach a problem, which language constructs to use, pros and cons of each approach, and how to refactor your code.

## 3. Excercises

### 3.1 From JavaScript to TypeScript
In the Examples folder, make a copy of the file [`FromJStoTS.js`](./Examples/1_javascript-to-typescript/FromJStoTS.js), rename it to .ts, and rewrite it to be valid TypeScript. There are lots of ways to improve upon the given code. Use this excercise to try out different TypeScript features.

> Refactor the example: [`FromJStoTS.js`](./Examples/1_javascript-to-typescript/FromJStoTS.js)