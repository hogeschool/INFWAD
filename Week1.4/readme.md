# Lecture notes: 1.4 - TypeScript
The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## Introduction to TS
TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- **JavaScript and a lot More** : TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor. Catch errors early in your editor.
- **Runs as Javascript** : TypeScript code compiles to JavaScript, which runs anywhere JavaScript runs: In a browser, on Node.js, Deno, Bun and in your apps.
- **Required Tools** : Something to install the TypeScript compiler with (for example, Node.JS and npm).


### Installation

If you are a beginner, start with `npm` instead of the newer package managers.

- Follow instructions for installing Node.js + npm here:

  https://nodejs.org/en/download/current

  (Select `nvm + npm`, or `Volta + npm`)

  (You might have to uninstall your current Node.js version first)

### TypeScript reference
- https://www.typescriptlang.org


### Creating your project
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
  
### Testing

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


## The Basics
https://www.typescriptlang.org/docs/handbook/2/basic-types.html

1. Hello TS
2. variables, data types and type inference, static type checking, let and const
4. functions

### 1. Hello TS
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

### 2. Types
https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
https://www.typescriptlang.org/docs/handbook/variable-declarations.html
- The primitives: string, number, and boolean;
Typescript, like JavaScript, has these three very commonly used primitives. 
The type names String, Number, and Boolean (starting with capital letters) are legal, but refer to some special built-in types that will very rarely appear in your code. Always use `string`, `number`, or `boolean` for types.

- Implicit any and explicit any: TypeScript also has a special type, any, that you can use whenever you don’t want a particular value to cause typechecking errors. *we will not use `any` anywhere*

- `let` and `const` and `var` (don't use var). const is an augmentation of let in that it prevents re-assignment to a variable. All declarations other than those you plan to modify should use const.

  ```ts
  let x = 10
  const y = "hello world"

  x=11
  y = "A new string" //Cannot assign to 'y' because it is a constant
  ```
  
  The names introduced by `let` and `const` are only available within the block (delimited by `{` and `}`) in which they are declared. This is called _scope_ and is considered the standard behaviour in modern programming languages:

  ```ts
  const x = 100
  console.log(x)
  {
    let x = "hello world!"
    console.log(x)
  }
  console.log(x)
  ```
  will print:

  ```sh
  100
  hello world!
  100
  ```
- **Operations**

  In TypeScript all numbers are `double` precision floating points (64 bits). In some cases we might use `bigint` 

  ```ts
  let i = 3 //  i and j are of type number
  let j:number = 2
  console.log(i + j, i * j, i / j, i % j ,i ** j)

  let k:bigint = 3n
  let l = 2n
  console.log(k + l, k * l, k / l, k % l ,k ** l)
  ```
- Static type checking

- **arrays, tuple, deconstruction**

  In order to declare more than one values, typescript allows to declare arrays. The general syntax is `datatype[]` or `Array<datatype>` for example
  ```ts
  const names = ["Alice", 'Bob', `Charlie`]
  names.push("Diana")
  console.log(names)

  let grades:number[] = [7.5, 9, 0, 10]
  let Status = Array<boolean>(4)
  Status[0] = grades[0]!>5.5

  ```

### 3. Functions

Functions are the basic building block of any application, whether they’re local functions, imported from another module, or methods on a class. They’re also values, and just like other values, TypeScript has many ways to describe how functions can be called. Let’s learn about how to write types that describe functions.

```ts
function Add(a:number,b:number){
  return a+b
}    
//OR lambda style
const Add2 = (a:number,b:number):number=>a+b;
const Add3:(a:number,b:number)=>number = (a,b)=>a+b;
```

Let us explore ts with one example, imagine you need to write a function to add an array of numbers, let us call this AddAll

```ts
function AddAll(arr:Array<number>):number{
  let result=0;
  for(let i=0; i<arr.length; i++){
    result+=arr[i]!;
  }
  return result;
}
```
Instead of addall what it needs to be done to make it multiply all? the two changes required are instead of summing up `result+=arr[i]!;`, multiply `result*=arr[i]!;` and one more change, i.e. start with Mulitiplicative identity `let result=1;` instead of additvie identity `let result=0;`.
What if i need to write method to find maximum or minimum value from the array? can I re-write the general purpose method to use it for various purposes?

```ts
enum operations {add, mul,gt, lt}
function ActionAll(arr:number[], action:operations, initVal:number){
  let result = initVal;
  for(let i=0; i<arr.length; i++){
    switch(action){
      case operations.add: result += arr[i]!; break;
      case operations.mul: result *= arr[i]!; break;
      case operations.gt: result  = result>= arr[i]!? result: arr[i]!; break;
      case operations.lt: result  = result <= arr[i]!? result: arr[i]!; break;
    }      
  }//end for
  return result;
}
//Example Usage
let values:number[] = [1,2,3,4,5]

let sum = ActionAll(values, operations.add, 0)
let product = ActionAll(values, operations.mul, 1)
let max = ActionAll(values, operations.gt, Number.MIN_VALUE)
let min = ActionAll(values, operations.lt, Number.MAX_VALUE)
```

It is also possible to modify by avoiding initial value, and also making method a little more safe.

```ts
enum operations {add, mul,gt, lt}
function ActionAll(arr:number[], action:operations){
  if(arr.length<=0) throw new Error("Empty array");
  if(arr[0]==undefined) throw new Error("Empty at index 0");
  let result = arr[0];
  for(let i=1; i<arr.length; i++){
    if(arr[i]==undefined) throw new Error(`Empty at index ${i}` );
    switch(action){
      case operations.add: result += arr[i]!; break;
      case operations.mul: result *= arr[i]!; break;
      case operations.gt: result  = result>= arr[i]!? result: arr[i]!; break;
      case operations.lt: result  = result <= arr[i]!? result: arr[i]!; break;
      default: throw new Error (`Undefined operator ${action}`)
    }      
  }//end for
  return result;
}
```

- Control structures

As a side effect of the above example we tried out a couple of concepts.
if else, loop, switch case, throwing run time error. and enum.

- Lambda expressions and Higher order functions

the above implementation is limited to given set of operations only, if we want a more generalized implementation then the opeartion must be flexible and should be defined later. the exeption handeling is removed for simplicity.

```ts
function ActionAllHoF(arr:number[], fxy:(a:number, c:number):number):number{
  let result = arr[0];
  for(let i=1; i<arr.length; i++){
    result = fxy(result, arr[i]!)
  }//end for
  return result;
}
//Example Usage
let values:number[] = [1,2,3,4,5]

let sum = ActionAllHoF(values, (a,b)=>a+b)
let product = ActionAllHoF(values, (a,b)=>a*b)
let max = ActionAllHoF(values, (a,b)=>a>=b? a:b)
let min = ActionAllHoF(values, (a,b)=>a<=b? a:b)
```
Nice? Now what if I want to use this ActionAllHoF(HoF stands for Higher-order-Function for simplicity) for any other data types most obvious is for example bigint, or maybe for string or any other data types? You understood it right, let us use generics.

- Generics

```ts
function ActionGeneric<T>(arr:Array<T>, fx:(a:T, b:T)=>T ){
  if(arr.length<=0) throw new Error("Empty array");
  if(arr[0]==undefined) throw new Error("Empty at index 0");
  let result = arr[0];
  for(let i=1; i<arr.length; i++){
    if(arr[i]==undefined) throw new Error(`Empty at index ${i}` );
    result = fx(result, arr[i]);  
  }
  return result;
}
```

what about the curried version?

```ts
function ActionCurried<T>(fx:(a:T, b:T)=>T){
  return(arr:Array<T>)=>{
    if(arr.length<=0) throw new Error("Empty array");
    if(arr[0]==undefined) throw new Error("Empty at index 0");
    let result = arr[0];
    for(let i=1; i<arr.length; i++){
      if(arr[i]==undefined) throw new Error(`Empty at index ${i}` );
      result = fx(result, arr[i]);  
    }
    return result;
}
//Example Usage

```

- Recursion

Let us start with oversimplified example of recursion, consider an an example to calculate factorial
where n! =  n (n1) (n-2) .. 0!. for simplicity the example considers factorial of <=0 is 1
```ts
function iterative(n:number):number{
  if (n<=0) return 1;
  let result = 1
  for(let i=2; i<=n; i++)
    result  *=i
  return result
}

function recursion(n:number):number{
  if(n<=0) return 1;
  return n* recursion(n-1)
}

const rlambda:(n:number)=>number =(n)=> n<=0? 1: n * rlambda(n-1);
```

Now let us use the concept of recursion with our previous example, moreover sometimes the return type of function may or may not be the same, let us modify the signature and rename it to something like reduce

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

// Example
const nums = [1, 2, 3, 4];
const sum = Reduce<number, number>((a, b) => a + b, 0)(nums);
const product = Reduce<number, number>((a, b) => a * b, 1)(nums);
console.log(sum, product);

//OR

function Reduce<T, R>(fn: (acc: R, cur: T) => R, init: R) {
  return function recur(arr: T[]): R {
    if (arr.length === 0) return init;
    const [head, ...tail] = arr;
    return Reduce(fn, fn(init, head))(tail);
  };
}

// Usage
const nums = [1, 2, 3, 4];
console.log(Reduce((a, b) => a + b, 0)(nums)); // 10
console.log(Reduce((a, b) => a * b, 1)(nums)); // 24
```

Apart from reduce we may have filter and map

```ts
function MapGeneric<T, R>(arr: Array<T>, fn: (val: T, index: number) => R): Array<R> {
  const result: Array<R> = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i]!, i));
  }
  return result;
}

// Example
const squared = MapGeneric([1, 2, 3], (x) => x * x);
console.log(squared); // [1,4,9]

//OR
function Map<T, R>(fn: (x: T) => R) {
  return (arr: T[]): R[] => {
    if (arr.length === 0) return [];
    const [head, ...tail] = arr;
    return [fn(head), ...Map(fn)(tail)];
  };
}

// Usage
console.log(Map((x: number) => x * 2)([1, 2, 3])); // [2, 4, 6]
```

```ts
function FilterGeneric<T>(arr: Array<T>, pred: (val: T, index: number) => boolean): Array<T> {
  const result: Array<T> = [];
  for (let i = 0; i < arr.length; i++) {
    if (pred(arr[i]!, i)) result.push(arr[i]!);
  }
  return result;
}

// Example
const evens = FilterGeneric([1, 2, 3, 4], (x) => x % 2 === 0);
console.log(evens); // [2,4]

//OR
function Filter<T>(pred: (x: T) => boolean) {
  return (arr: T[]): T[] => {
    if (arr.length === 0) return [];
    const [head, ...tail] = arr;
    return pred(head) ? [head, ...Filter(pred)(tail)] : Filter(pred)(tail);
  };
}

// Usage
console.log(Filter((x: number) => x % 2 === 0)([1, 2, 3, 4])); // [2, 4]
```

We may reuse of reduce to do quite a lot of things for example reduce can be used to map, and filter as well.

Reusing Reduce to implement Map and Filter

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

## Excercises

### 1. From JavaScript to TypeScript
In the Examples folder, make a copy of the file `FromJStoTS.js`, rename it to .ts, and rewrite it to be valid TypeScript. There are lots of ways to improve upon the given code. Use this excercise to try out different TypeScript features.