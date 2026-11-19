# API Security

## Recap

In the previous lesson we learned how to create RESTful API endpoints in Express. We set up API routes that respond with JSON instead of HTML views. We created GET endpoints to retrieve all products and individual products by ID. We learned about CORS and why it's necessary when your front-end and back-end run on different origins. We also implemented query parameters to filter products by category, and created a POST endpoint to add new products to our database. We tested all our endpoints using `.rest` files with the REST Client extension in VS Code.

## Login authentication
To secure our API we need to have different users. An user is an *actor* using our web application which makes requests to our API endpoints.

We want users to authenticate themselves so we can confirm they are authorized to access certain endpoints. For example, a normal user of the application would not be allowed to delete or edit products. An user with admin rights will be allowed to do this. 

Authentication and security is an important part of any web application. Having a flaw in your authentication code can have big consequences. For this reason many developers make use of libraries like *Passport.js*. Or even completely out-source it from the codebase and use cloud tools like *Firebase* or *Microsoft Entra*. 

We opted to not use these solutions. We want to teach you the techniques to make you understand how it works instead of just using libraries. This means our authentication will keep it simple without email confirmation or 2FA systems. 

### User entity

We start by creating the user entity. The entity is the class which will represent the database table, like we have seen in previous lessons.

An user will authenticate itself by using an email and password combination, we also need to store their role (admin, user, etc). To address a user properly we will also store their name. And of course we're gonna need an Id as primary key in the database table. 

In the `models` folder create a new file `User.ts` and get the following class in there. You can save yourself some time by copy/paste another model and adjust the code. 

```TS
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    name!: string;

    @Column("text", { unique: true })
    email!: string;

    @Column("text")
    password_hash!: string;

    @Column("text")
    role!: string;

    constructor(name: string, email: string, password_hash: string, role: string) {
        this.name = name;
        this.email = email;
        this.password_hash = password_hash;
        this.role = role;
    }
}
```

Adjust the `data-source.ts` file to import and include this entity.
```TS
entities: [Product, Category, User],
``` 

Run your server and see in the terminal logs that the User table gets created. Later during this lesson we will get to *seed* this table, but first we need to work out our password hashing!


## Password hashing

Password hashing is a one-way transformation process that converts a plain-text password (the input) into a fixed-length string of characters (the output, called the hash or digest). If your database is compromised (a common occurrence called a "data breach"), any passwords stored in plain text are immediately available to the attacker, who can then use those credentials to access the user's account and accounts at other servives (since many users reuse passwords).
By storing the hash instead, even if the attacker gains access to your database, they only get an unintelligible string of characters. Without knowing the original password, the hashes are useless to them.

### Hashing vs encryption
Hashing and encryption are different things. Hashing is one-way, you can not reverse a hash back to the original text. Encryption is two-way, you can *decrypt* it back to the original text. If the passwords are encrypted get compromised the attacker could still recover the original password if he knows the encryption algorithm. This makes using encryption for password storage not safe. 
This is way we use hashing, the attacker cannot recover the original password. In our code we can check an entered password (by the user) by hashing it and then compare it to the hash stored in the database, if they match the entered password is correct. 

### Rainbows and salt
A Rainbow Table is a table with precomputed hashes for common passwords. If an attacker gains access to our database (with the hashed passwords) he could use a Rainbow Table to look up the hash and see the original password. We can prevent this by *salting* the hash. Adding a unique, random string of characters (a salt) to every password before it is hashed. The salt is stored alongside the hash in the database.
Since every user's hash is created using a unique salt, two users with the same password will have different hashes.
To use a Rainbow Table against a salted hash, the attacker would have to generate a completely new table for every single unique salt, which would take a very long time.

There is another technique, *peppering*, which adds another string to the hash. This string is the same for every user but is not stored in the database, so an attacker would not gain access to it if he just has the database. Using pepper would prevent the attacker from generating a new Rainbow Table if he doesn't have the *pepper*, even for a single user. We will keep it simple with only *salting* in our application.

### Time to code

NodeJS has a built in cryptographic library we can use for hashing (using the *scrypt* algorithm). This library doesn't use async/await out of the box, but we will fix that. We want it to be async so it doesn't block the process loop while hashing a password. 
In our `utils` folder, create a new file called `password.ts`. The result of the hashing is called a key, this is the hash in binary form (raw). To store it in our database we want a text version so we encode the binary data to a hexadecimal string.

Import the crypto library and *promisify* it so it supports *await*

```TS
import * as crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

```

Now write the method to salt and hash our password. 
```TS
export async function hashPassword(password: string) {
    // 1. Generate a unique, random salt with a length of 16 bytes
    const salt = crypto.randomBytes(16).toString('hex');

    // 2. Derive the key. The result is raw data (a Buffer).
    // 64 bytes is the final size of our hash
    const derivedKeyRaw = await scryptAsync(password, salt, 64) as Buffer;

    // 3. Convert the raw data (Buffer) into a readable Hex String for storage.
    const hashHex = derivedKeyRaw.toString('hex');

    // 4. Put the salt and the hash together, separated by a colon (:)
    return `${salt}:${hashHex}`;
}

```

### Timing attack
There's one more trick an attacker can use and we need to prevent. Comparing two strings will take a certain amount of time. This time will be shorter if the two strings mismatch earlier and longer if they match almost all the way. If we compare the hashes with normal string comparison an attacker can time how fast our endpoint responds to see how close the passwords match. 

To prevent this we're not gonna compare the two strings, but we will compare the raw data using a method from the crypto library which is designed to always take the same time. Now we can complete our comparePasswords function. 

```TS
export async function comparePasswords(password: string, storedValue: string) {
    // 1. Split the stored value to get the salt and hash
    const [salt, originalHashHex] = storedValue.split(':');
    
    // 2. Re-hash the attempt
    const derivedKeyRaw = await scryptAsync(password, salt, 64) as Buffer;
    
    // 3. Convert stored hash to Buffer
    const originalHashBuffer = Buffer.from(originalHashHex, 'hex');

    // 4. Length check (Necessary to prevent crypto.timingSafeEqual from crashing)
    if (originalHashBuffer.length !== derivedKeyRaw.length) {
        return false;
    }

    // 5. Constant-time comparison
    return crypto.timingSafeEqual(originalHashBuffer, derivedKeyRaw);
}
```


## JWT 

We want our API to be **RESTful**, like we discussed earlier. One of the rules of REST is that it should be *stateless*, meaning the API should not store a state. This means we cannot remember which users are currently active or currently logged-in. Every API request the client makes must contain all information we need to authenticate en authorize the user. To accomplish this we can use JWT (JSON Web Tokens). In this token the user information is stored, which the API validates upon receiving the request.

If an users wants to login to our application, the front-end sends his entered email and password to the API. The server gets the stored hashed password (from the database) and uses the earlier created comparePasswords method to compare them. If it is correct the server generates a JWT containing information about the user (and an expire date) which it returns to the client (front-end). The client stores this JWT and for each following API request it sends the JWT back to the server, which the server validates to authenticate the user. 


### Authentication vs Authorization
We quickly want to mention these two words as they are often mixed up. **Authentication** is verifying who the user is, by doing the password check upon login or validating the JWT. **Authorization** is verifying what the user is allowed to do, by using the information from the JWT to check if his request is valid. An example of authorization is, an user is only allowed to update its own profile, not the profile of other users. While **Authentication** proves you are "User A," **Authorization** is the logic that says: "User A can edit Profile A, but User A cannot edit Profile B."


## Coding our authentication 

We want our API to be RESTful, which states that endpoints must be resource based, like `/users` or `/products`. A successful login from the client would return a JWT, this token can be considered a resource, thus our API endpoint to login would become `POST /tokens`. This is the purist way of implementing the REST API. In real life you'll often see the authentication is an exception to the resource rule. Many APIs will have a `/auth` path containing action based endpoints like `/auth/login` and `/auth/register`. 

**💡 Thought exercise**
- Not all API will have an `/auth/logout` endpoint, why?
- If there is no logout endpoint, how does an user actually logout? 
- What is the security risk of not having a server-side logout?

### Create the router and controller

Create the files `auth.routes.ts` and `auth.controller.ts` in the correct places. Set up the empty login and register methods in the controller

```TS
import type { Request, Response } from "express";

export async function loginUser(req: Request, res: Response) {

}

export async function createNewUser(req: Request, res: Response) {

}
```

Set up the endpoints in the router.
```TS
import express from "express";

import { loginUser, createNewUser } from "../../controllers/api/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", createNewUser)

export default router;

```

Add the router to our `index.ts` to register the routes.
```TS
import authApiRouter from './routes/api/auth.routes.js';

app.use("/api/auth", authApiRouter);
```



👉  **Exercises: Finish the createNewUser method**\
Let's create the register method first. We'll assume the request body contains a json containing the name, email and plaintext password. Using our knowledge from previous lessons would should be able to correctly finish this method now. Think of which steps need to be done. Feel free to look at the product controller where we have handles a POST request before.

Extract the data from the `req.body`. Hash the password. Create a new User model instance (set the role to `user`) and save it using TypeORM. Respond a `201` with the new user data. Do **not include** the hashed password in the response. 


### loginUser method

Let's go through this method together as it's requires generating the JWT. Assume we receive a request body containing a email and a plaintext password.

Our `comparePasswords` method requires the entered plaintext password and the stored password from the database. We need to extract the data from the `req.body`, get the `User` from the database by the email and then call `comparePasswords`. Respond status `401` if anything is wrong. So far we've got...

```TS
import { AppDataSource } from "../../data-source.js";
import { User } from "../../models/User.js";
import { comparePasswords } from "../../utils/password.js";

const userRepository = AppDataSource.getRepository(User);

export async function loginUser(req: Request, res: Response) {

    const email = req.body.email;
    const plaintextPassword = req.body.password;

    const user = await userRepository.findOneBy({ email: email })

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordsMatch = await comparePasswords(plaintextPassword, user.password_hash);

    if (!passwordsMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // TODO: Generate the JWT and send it back

}
```

**💡 Thought exercise**\
In this code we already made one security flaw an attacker could abuse. Which one? How could we solve it?

As explained earlier, an attacker can time a response. Responding before checking the password gives a faster result then after checking the password, hinting the attacker the email is correct. We could fix this by passing an empty dummy password, but we'll keep it simple like this for now. This is an optional improvement to make as homework. 


## Generate the JWT

Node or Express does not include JWT handling by default but we can easily install an package for this. We will generate a JWT and return it. We'll return to this topic in the next lesson to improve the code and implement authorization. 
```
# Install the library
npm install jsonwebtoken

# Install the types (for TypeScript support)
npm install --save-dev @types/jsonwebtoken
```

### How does JWT work?
We use this package to sign the JWT, as seen in this code. What actually happens? JWT is a JSON object which contains the information we need. It contains a *payload* which is information about the user (the user id and role) and an expiration date. They payload and the secret key together are hashed, which we call the *signature*

The signature and the payload are encoded together into one long string. This string is sent to the client. The client stores this string and with the next API call it will send this string back to the server.

The server will decode the string again into the separate payload and signature. It will hash the payload with the secret key to see if this still matches the signature. If so, we know it is not tampered with and the JWT is valid. The server will also check if the expiration date has not passed. 

An attacker at the front-end could also decode the JWT but he won't have the secret key to properly adjust the signatrure. So if an attacker adjusts his role to 'admin' in the payload, the signature won't match anymore, and the server will reject it. 

**Important!** As the payload can be decoded by the client, never include sensitive information like a password in it. 



```TS
const token = jwt.sign(
    { 
        id: user.id, 
        role: user.role // Adding the role here
    }, 
    "my_temporary_secret_123", // Using a hardcoded secret for now
    { expiresIn: '1h' }
);

res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
```

Besides the token we also return a `user` object with the basic profile information. This is common practice, it lets the frontend know who just logged in (name for a greeting, role for showing the right UI) without having to decode the JWT or make an extra API call. Never include sensitive fields like the password hash.

---

## What's Next

In this lesson you built the authentication core: the User entity, password hashing with salting, and JWT generation upon login. You have a working register and login endpoint.

We haven't tested these endpoints yet or seeded any users into the database, that's intentional. In **Lesson 7** we'll set up environment variables for the JWT secret, seed admin and regular users, create middleware that validates JWTs automatically, and test the full auth flow using `.rest` files.

**Before moving on, verify you have:**
- User entity created and included in the data source
- Password hashing utilities (`hashPassword` and `comparePasswords`) implemented
- Auth routes registered (`POST /api/auth/login` and `POST /api/auth/register`)
- `loginUser` generates a JWT and responds with `{ token, user: { ... } }`
- `createNewUser` exercise completed




