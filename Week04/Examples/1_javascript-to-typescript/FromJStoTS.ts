
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    zip?: string;
  };
}

function add(a: number | string, b: number | string): number {
  if (typeof a === "string") {
    a = parseFloat(a);
  }
  if (typeof b === "string") {
    b = parseFloat(b);
  }
  return a + b;
}

function average(numbers: (string|number)[]): number {
  let total = 0;
  for (let n of numbers) {
    if (typeof n === "string") {
      n = parseFloat(n);
    }
    total += n;
  }
  return total / numbers.length;
}

function findUser(id: number, users: User[]) {
  for (let u of users) {
    if (u.id === id) {
      return u;
    }
  }
  return null;
}

function printAddress(user: User) {
  console.log(
    user.address.street + ", " +
    user.address.city + " " +
    user.address.zip
  );
}

const users: User[] = [
  { id: 1, name: "Alice", address: { street: "Main St", city: "Utrecht", zip: "1234AB" } },
  { id: 2, name: "Bob", address: { street: "Kerkstraat", city: "Den Haag" } },
];

console.log(add(10, 5));
console.log(add("10", 5));

console.log(average([2, 4, 6]));
console.log(average(["2", "4", "6"]));

const user: User | null = findUser(1, users);
if (user) {
  printAddress(user);
}

type thingsArray = (string|number|object)[];

const things: thingsArray = [1, 2, 3];
things.push("vier");
things.push({ value: 5 });

console.log(things);

function getFirst(inputString: string): string {
  return inputString.substring(0, 1);
}

let first = getFirst("not an array");
console.log(first.toUpperCase());
