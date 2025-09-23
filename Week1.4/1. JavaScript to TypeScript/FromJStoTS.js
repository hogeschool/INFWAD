// JavaScript code with potential type issues

function add(a, b) {
  return a + b;
}

function average(numbers) {
  let total = 0;
  for (let n of numbers) {
    total += n;
  }
  return total / numbers.length;
}

function findUser(id, users) {
  for (let u of users) {
    if (u.id === id) {
      return u;
    }
  }
  return null;
}

function printAddress(user) {
  console.log(
    user.address.street + ", " +
    user.address.city + " " +
    user.address.zip
  );
}

const users = [
  { id: 1, name: "Alice", address: { street: "Main St", city: "Utrecht", zip: "1234AB" } },
  { id: 2, naam: "Bob", address: { straat: "Kerkstraat", stad: "Den Haag" } },
];

console.log(add(10, 5));
console.log(add("10", 5));

console.log(average([2, 4, 6]));
console.log(average(["2", "4", "6"]));

const user = findUser(1, users);
printAddress(user);

const things = [1, 2, 3];
things.push("vier");
things.push({ value: 5 });

console.log(things);

function getFirst(arr) {
  return arr[0];
}

let first = getFirst("not an array");
console.log(first.toUpperCase());
