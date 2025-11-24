# Lecture notes: 1.5 - TypeScript: Functional programming introduction

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Expanding on last week's subjects
Last week, we introduced you to the basics of TypeScript. We created a function that can apply multiple kinds of operations to an array of values. Then we rewrote it multiple times to apply recursion, higher order function patterns and currying.

While improving these functions, we basically recreated these built-in implementations:

- Reduce
- Map
- Filter

TypeScript provides built-in implementations of `map`, `reduce`, and `filter`:

```ts
const arr = [1, 2, 3, 4, 5];
console.log(arr.map(x => x * 2));       // Map
console.log(arr.filter(x => x % 2));    // Filter
console.log(arr.reduce((a, b) => a + b, 0)); // Reduce
```

The custom implementations that we discussed in the previous lesson could still be useful if you have collections of another type (like your own user defined types of list, tree, or graph data structure).

### 1.1 Common uses of these higher order functions

So... map(), filter(), and reduce() are used to process and manipulate arrays of data. But what would you use these for, in practice? Well, you will be using those a lot, often combined!

#### Transforming an array using `map()`
Transforms an array by applying a function to each element and returning a new array of the same length. Use map() when you need to apply the same operation to every element in an array and generate a new array with the transformed values. Examples:
- You have an array of users with their complete profile data, but you only need the ID of each user
- Do a calculation on every number in an array

#### Filtering an array using `filter()`
Create a new array containing only the elements that pass a given test. Use filter() when you need to select a subset of the elements in an array based on some condition and generate a new array with only the selected elements. Examples:
- You have an array of products, and only want the once above a certain price
- Filter out uneven numbers in an array

#### Reducing an array using `reduce()`
Aggregate the values of an array into a single value. Use reduce() when you need to perform some operation on every element in an array and combine the results into a single value. Examples:
- You have an array of users with their complete profile data, and want to know their average age
- You have an array of products in an order, and want to know the price total

## 2. Recursion
For those who are relatively new to recursion, it might be helpful to visualize what is going on. Watch the lesson recording from 00:27:50 to 00:34:00. We will step through the execution of a recursive implementation of Filter.

Recursive solutions are often more declarative, meaning they describe "what" needs to be done rather than "how" to do it step-by-step like an imperative loop.

## 3. User defined data types (the Object Oriented Programming way)
In the previous lesson, we familiarized ourselves with the primitive types (string, number, boolean). Now let's define our own types.

We will not go in-depth into object oriented programming, so we assume you are familiar with these principles. However, in TypeScript/JavaScript, the syntax (like `constructor`) might be new to you:

```ts
class Person {
  readonly name: string;
  age: number;

  constructor(name: string, age?:number) {
    this.name = name;
    this.age = age;
  }
}

const p1:Person = new Person("Alice", 20);
//p1.name = "Alice";
p1.age = 25;

console.log(p1);
```

Alternative:
```ts
class Person {
  constructor(public readonly name: string, public age?:number){}
}

const p1:Person = new Person("Alice", 20);

console.log(p1);
```

Extending a class:
```ts
class ExtendedPerson extends Person {
  extra: string;

  constructor(){
    super("Fixed Name");
  }
}

const e = ExtendedPerson("Alice");
e.age = 30;
e.extra = "whatever";

console.log(e);
```

Interfaces:
(An interface is a 'contract', any implementation has to follow the rules of the interface)

```ts
import * as fs from "fs";

interface logger {
  log(message: string): void
}

class ConsoleLogger implements logger {
  log(message: string): void {
    console.log(message);
  }
}

class FileLogger implements logger {
  constructor(public filePath: string) {}

  log(message: string): void {
    fs.appendFileSync(this.filePath, `${message}\n`);
  }
}

function useLogger(p: logger) {
  p.log("Example message");
}

useLogger(new ConsoleLogger());
useLogger(new FileLogger("logfile.txt"));
```

## 4. User defined data types (Using types)

Now let's see how to define our own types using the Type system.

A simple example:

```ts
type Success = {
  result: number;
  status: boolean;
}
```

Before we start using that, let's add some use of generics and discriminated unions as well:

```ts
type Success<T> {
  status: "OK"; // This is a Literal Type. Instead of any string, the variable 'status' can only contain the value "OK".
  result: T;
}

type Fail = {
  status: "Fail"; // This is a Literal Type. Instead of any string, the variable 'status' can only contain the value "Fail".
  reason: string;
}

// This is type algebra: (the new type 'ReturnType', is a combination of the Success and Fail types)
// (This is an example of discriminated unions)
type ReturnType<T> = Success<T> | Fail;
```

We will implement this below.

Let's go back to one of the simpler examples from last lesson and improve it. We have added the exceptions back, as a good starting point for this exercise.

```ts
function MapGeneric<T, R>(arr: Array<T>, fn: (val: T, index: number) => R): Array<R> {
  if(arr.length<=0) throw new Error("Empty array");

  const result: Array<R> = [];
  for (let i = 0; i < arr.length; i++) {
    if(arr[i]==undefined) throw new Error(`Empty at index ${i}`);
    result.push(fn(arr[i]!, i));
  }
  return result;
}

// Example usage
try {
  const squared = MapGeneric([1, 2, 3], (x) => x * x);
  console.log(squared); // [1, 4, 9]
} catch(e) {

}
```
The try {} catch {} has been added to make sure the program continues running when there is an error. Otherwise, the user will not be able to continue using our program.

But there is better way. We can make our code even safer, and inform the user that there was a failure, instead of throwing an exception.

We can make something that returns a result of type ReturnType, that includes a status, and a reason if there is a failure:

```ts
type Success<T> {
  status: "OK"; 
  result: T;
}

type Fail = {
  status: "Fail";
  reason: string;
}

type ReturnType<T> = Success<T> | Fail;

function MapGeneric2<T, R>(arr: Array<T>, fn: (val: T, index: number) => R): ReturnType<R> {
  if(arr.length<=0) return {status: "Fail", reason: "Empty array"};

  const result: Array<R> = [];

  for (let i = 0; i < arr.length; i++) {
    if(arr[i]==undefined) return {status: "Fail", reason: `Empty at index ${i}` };
    result.push(fn(arr[i]!, i));
  }

  return {status: "OK", result: result};
}

// Example usage
const res = MapGeneric([1, 2, 3], (x) => x * x);

if (res.status == "Fail") {
  console.log(res.reason);
} else {
  console.log(res.result); // [1, 4, 9]
}
```

Because we are not throwing errors anymore, we don't need the try/catch anymore, and it will not crash.


## 5. User defined types example: User data

We will keep playing around with types. Let's demonstrate another useful real-life example, like user data:


```ts
type Admin = {
  kind: "admin";
  id: number;
  name: string;
  permissions: string;
}

type Member = {
  kind: "member", id: number, name: string, points: number;
}

type User = Admin | Member;
```

```ts
// Pretend this was loaded from JSON
const apiUsers:Array<User> = [
  { kind: "member", id: 1, name: "Alice", points: 42 },
  { kind: "admin", id: 2, name: "Bob", permissions: ["read", "write"] },
  { kind: "member", id: 3, name: "Charlie", points: 5 }
];

// In my application, let's say I want to use only the names of people:

// We use map()
const onlyNames = apiUsers.map(x=>x.name);
console.log(onlyNames);

// Or only the members, not the admins:

// We use filter()
const onlyMembers = apiUsers.filter(x=>x.kind=="member");
console.log(onlyMembers);

// Or return only the total points of all members:

// We use reduce(), and gather the points inside an variable 'acc' (accumulator)
// The "admin" users don't have points, so we need to do something to prevent errors.
const onlyPoints1 = apiUsers.reduce((acc, x)=>x.kind=="member"? acc + x.points : acc, 0);
console.log(onlyPoints1);

// That was complicated. Let's make something that's easier to read:
const onlyPoints2 = apiUsers.filter(x=>x.kind=="member").reduce((acc, x)=> acc + x.points, 0);
console.log(onlyPoints2);

// Or make each step clear:
const onlyPoints3 = apiUsers.filter(x=>x.kind=="member").map(x=>x.points).reduce((acc, x)=> acc + x, 0);
console.log(onlyPoints3);

```

## 6. User defined types example: Products

With this example, we will introduce ***function composition***.

This is the process of combining two or more functions to produce a new function, where the output of one function becomes the input for the next. This is often done to create more modular, readable, and reusable code.

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

const products: Product[] = [
  { id: 1, name: "Laptop", price: 1200, inStock: true },
  { id: 2, name: "Phone", price: 800, inStock: false },
  { id: 3, name: "Tablet", price: 600, inStock: true }
];

// The examples below were part of live coding examples, to demonstrate different ways of doing things:

// I want to find a product in a certain price range: Under 1000
console.log(products.filter(x=>x.price<=1000));

// Updated to only show products that in stock:
console.log(products.filter(x=>x.price<=1000).filter(x=>x.inStock));

// But that is not very good. This is much better, because the above will create two arrays (one for each filter). Imagine that is happening for 1 million products...
console.log(products.filter(x=>x.price<=1000 && x.inStock));


// But what if you want to filter on many things? The line of code will become quite long and unmaintainable.
// You could make something that splits up these steps:

function And<T>(f1:(a:T)=>boolean, f2:(a:T)=>boolean) {
  return function(a:T){ return f1(a) && f2(a); }
}

function Or<T>(f1:(a:T)=>boolean, f2:(a:T)=>boolean) {
  return function(a:T){ return f1(a) || f2(a); }
}

const finalFilter = And<Product>(x=>x.price<=1000, x.inStock);
console.log(products.filter(finalFilter));


// Another example of composition
// f(g(x)) = x=>g(x)=>f(y)=>z

function Then<X,Y,Z>(f:(a:Y)=>Z, g:(a:X)=>Y) {
  return function(a:X){ return f(g(a)); }
}

// With lambda notation in one line:
const Then2 = <X,Y,Z>(f:(a:Y)=>Z=> (g:(a:X)=>Y)=> (a:X)=> f(g(a));

```

## 7. Summary of concepts in this introduction to functional programming

### 7.1 Currying 
Currying is used in JavaScript to break down complex function calls into smaller, more manageable steps. It transforms a function with multiple arguments into a series of functions, each taking a single argument, then returns a function that will accept the next parameter, etc.

This way we can set some arguments in advance in the function and call it later with the remaining arguments.

### 7.2 Immutability
Especially with code that is asynchronous, where you cannot know in which order parts of your code are executed, immutability is essential for creating stable, predictable code. Immutable objects don't change after creation, which simplifies debugging, enhances performance in some contexts, and helps avoid side effects.

### 7.3 Pure functions
A pure function is a function that always returns the same output for the same inputs and has no side effects. This means it doesn't change any external variables or state and doesn't depend on any external state. This predictability makes code easier to understand, re-use, test, and debug, as you can think of the function like a mathematical equation—it just takes inputs and produces an output.