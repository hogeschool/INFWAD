# Setup for the frontend

## Node.js and NPM for the front-end.

I'm sticking with NPM only. No Yarn, pnpm, etc. NPM is still the default today and it's pretty good. Feel free to explore the alternatives!

Let's pretend I don't have it yet so I can show you how I would install it. We'll check first:

```bash
node -v
npm -v
```

Now let's go here:
https://nodejs.org/en/download/current

(Select `nvm + npm`, or `Volta + npm` if you're on Windows)

I've seen some students click those green buttons for the prebuilt installers, but what we suggest is using the dropdowns above, which generate some commands to copy paste into your terminal. For example, since I am on macOS, I'll choose nvm (to be able to switch versions quickly) and npm of course, for package management.

It gives me these commands:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
\. "$HOME/.nvm/nvm.sh"
```

```bash
nvm install 25
```

```bash
node -v # Should print "v25.2.1".
```

```bash
npm -v # Should print "11.6.2".

```

Let's run them. Now we have the prerequisites covered.
