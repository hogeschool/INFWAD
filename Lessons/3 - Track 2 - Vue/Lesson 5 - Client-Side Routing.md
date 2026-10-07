# Lesson 5: Client-Side Routing and Navigation

In Lesson 4, you organized your product feature into clear components: a page coordinator, a form, a list, and cards. That solved complexity *inside* a single feature. But your app still only has one "page." What if you want a home page, an about page, and a product detail page?

Right now, you could use `v-if` to swap between views based on some component state. But that creates problems immediately. A user can't copy the URL and share it with someone else. Refreshing the browser resets whatever view was active. The browser's back and forward buttons don't work. The URL bar always shows the same address no matter what the user is looking at.

**Client-side routing** solves this by connecting URLs to page components. The URL becomes a reliable description of what the user sees. Change the URL, the page changes. Share the URL, someone else sees the same page. This is the same idea behind React Router, Angular Router, and SvelteKit routing. The syntax differs, but every modern frontend framework needs a way to map URLs to views.

By the end of this lesson, your app will have a home page, a products page, an about page, a product detail page, and a not-found page, all connected to real URLs with working browser navigation.

---

## Before You Start

You should continue from your Lesson 4 result. That means your project already has a page  and reusable components for product management.

You should still have these files in place:

- `src/pages/ProductManagementPage.vue`
- `src/components/ProductForm.vue`
- `src/components/ProductList.vue`
- `src/components/ProductCard.vue`
- `src/composables/useProducts.ts`

If your structure is slightly different, that's fine, but make sure the products feature still works before you add routing.

👉 **Exercise 0: Confirm your baseline**\
Run your app with `npm run dev` and verify that create, edit, cancel, and delete all still work. You don't want to debug old issues after adding new code.

---

## What is Client-Side Routing?

Think back to how traditional websites work. Every time you click a link, the browser sends a request to the server, which responds with a completely new HTML page. The browser throws away the old page and renders the new one from scratch.

In a Single Page Application (SPA), the browser loads one HTML file and one JavaScript bundle. After that, navigation happens entirely in the browser. When you click a link, JavaScript intercepts it, updates the URL, and swaps out the page component, no server request, no full reload.

This is **client-side routing**: a piece of code that watches URL changes and decides which component to display based on the current path. It's like a traffic controller sitting between the URL bar and your components.

Every framework has its own router library:
- **Vue** uses Vue Router
- **React** uses React Router (or TanStack Router, or Next.js routing)
- **Angular** has a built-in Router module
- **Svelte** uses SvelteKit's file-based routing

The concepts are identical: define paths, map them to components, and let the router handle the rest.

---

## Understanding the Architecture

Before writing code, let's understand what goes where. When students get stuck with routing, it's usually because they put code in the wrong file.

**`src/router/index.ts`**, The route configuration. This file answers one question: which component should render for which URL? Think of it as a lookup table.

**`src/main.ts`**, The application bootstrap. This is where you register the router as a plugin, just like you'd register any other Vue plugin.

**`src/App.vue`**, The application shell. This file contains layout that stays visible across all pages (like a navigation menu) and a placeholder where page content gets swapped in and out.

This separation matters. Routing is application-wide configuration, not page-specific logic. Your page components shouldn't know about routing setup, and your router shouldn't contain business logic.

---

## Installing Vue Router

Vue Router is a separate package. Install it in your project:

```bash
npm install vue-router
```

This adds Vue Router to your `package.json` dependencies. Now you need to wire it up in three places: create the router, register it as a plugin, and add a route outlet to your shell.

### Step 1: Create the router module

Create a new folder `src/router/` and inside it create `index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = []

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

**What's happening here?**

`createRouter(...)` creates a router instance for your app. Think of it as a navigation controller. It watches URL changes, figures out which route matches, and tells Vue which page component to render.

The configuration object has two key options:

- **`history`**, Defines how URLs work in the browser. `createWebHistory()` gives you clean paths like `/products` instead of hash-based URLs like `/#/products`. The hash-based approach (`createWebHashHistory()`) is an older technique that doesn't require server configuration, but clean URLs are the modern standard.

- **`routes`**, The route table. An array of records that map URL paths to components. We start with an empty array on purpose, you're setting up the infrastructure before defining pages.

The `RouteRecordRaw[]` type annotation keeps things explicit and type-safe. TypeScript will validate that every route record has the correct structure. Without this type on an empty array, you might get implicit `any` errors depending on your compiler settings.

### Step 2: Register the router plugin

Open `src/main.ts` and register the router **before** mounting the app:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

The order matters here. If `app.use(router)` comes after `app.mount('#app')`, the router won't initialize correctly because the app is already running before the router gets registered.

### Step 3: Add the route outlet

Open `src/App.vue` and replace its current content. Remove the `ProductManagementPage` import and rendering, and replace the template with just a `RouterView`:

-> Once Vue Router is registered with `app.use(router)` in main.ts, it globally registers `RouterView` and `RouterLink`, so they’re available in templates without imports. 

```vue
<script setup lang="ts">
</script>

<template>
  <RouterView />
</template>
```

`RouterView` is a special component provided by Vue Router. It's a placeholder, Vue Router injects whichever page component matches the current URL into this spot. When the URL changes, the component inside `RouterView` gets swapped out automatically.



This is similar to how other frameworks handle it:
- **React Router** uses `<Outlet />` or `<Routes>` with `<Route>` elements
- **Angular** uses `<router-outlet>`
- **Svelte** uses file-based routing with `+page.svelte` files

Same concept: a placeholder where page content appears.

👉 **Exercise 1: Wire up the router**\
Complete all three steps above. Run the app and confirm there are no startup errors in the terminal or browser console. The page will be empty, that's expected! You haven't told the router what to display yet. The important thing is that the app runs without errors.

---

## Creating Your First Routes

Now that the infrastructure is in place, let's define some real pages.

### Creating page components

Create two new page components. Keep them simple, one heading and one paragraph is enough.

Create `src/pages/HomePage.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <div>
    <h1>Welcome to the Product Catalog</h1>
    <p>Browse our collection of products or manage your inventory.</p>
  </div>
</template>
```

Create `src/pages/AboutPage.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <div>
    <h1>About</h1>
    <p>This is a product catalog built with Vue and TypeScript.</p>
  </div>
</template>
```

For the products page, you already have `ProductManagementPage.vue` from Lesson 4. No changes needed.

### Defining the route table

Now replace the empty routes array in `src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AboutPage from '../pages/AboutPage.vue'
import ProductManagementPage from '../pages/ProductManagementPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/products', component: ProductManagementPage },
  { path: '/about', component: AboutPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

Each object in the routes array is a **route record**. It says: "when the URL matches this `path`, render this `component`." That's it. You're declaring pages as URL mappings instead of writing imperative navigation logic.

Save and test. Start your server and open the given url, you should see your home page. Manually change the URL to `/products`, you should see your product management page. Try `/about`, the about page appears.

The pages work, but there's no way to navigate between them without manually editing the URL bar. That's next.

---

## Building Navigation

Your shell (`App.vue`) should contain a navigation menu that stays visible while pages swap inside `RouterView`. This is the same pattern you see on every website: the header and nav stay put, only the main content changes.

### RouterLink vs anchor tags

You might be tempted to use regular `<a>` tags for navigation. Don't! A normal `<a href="/products">` tells the browser to make a full HTTP request to the server. The browser throws away the current page, fetches a new one, and re-initializes everything. Your app state is gone. Your Vue components are destroyed and recreated.

`RouterLink` is Vue Router's replacement for `<a>`. When you click a `RouterLink`, JavaScript intercepts the click, updates the URL using the browser's History API, and tells `RouterView` to swap in the new component. No server request, no page reload, no lost state.

This is a universal SPA pattern:
- **Vue** uses `<RouterLink to="/path">`
- **React Router** uses `<Link to="/path">`
- **Angular** uses `<a routerLink="/path">`

Same idea, slightly different syntax.

### Adding the navigation menu

Update `src/App.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/products">Products</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>
```

A common beginner mistake is placing this menu inside each page component. Don't do that unless you intentionally want different menus per page. The shell belongs in `App.vue` because it's shared across all pages. You could extract the nav into a separate `NavigationMenu` component later, but for now let's keep it simple.

### Adding some styling

Now add these scoped styles to `App.vue`. They use the variables from the homemade `base.css` file, so you can inspect and adjust the colors there.

> Note: the default Vue starter `main.css` often includes a `display: flex` rule on the page body. That can conflict with your custom navigation layout, feel free remove or override those starter layout styles to get your website looking good.

```vue
<style scoped>
header {
  width: 100%;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

nav {
  padding: 1rem;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
}

nav a {
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius);
  text-decoration: none;
}

nav a.router-link-active {
  background: var(--color-primary);
  color: var(--color-primary-text);
}

main {
  width: 80%;
  margin: auto;
}
</style>
```

**Notice the `.router-link-active` class.** Vue Router automatically adds this CSS class to whichever `RouterLink` matches the current URL. You don't have to track the active page yourself, the router handles it. This is another advantage of using `RouterLink` over plain `<a>` tags.

👉 **Exercise 2: Test your navigation**\
Implement the nav menu and test all three routes. Click each link and confirm:
1. The URL updates in the address bar
2. The page content changes
3. No full page reload occurs (watch the browser tab, it shouldn't flash)
4. Browser back and forward buttons work correctly

---

## Dynamic Routes, Product Detail Page

So far, your routes are all static paths: `/`, `/products`, `/about`. But what about a page that shows details for one specific product? You can't create a separate route for every product, you need a **dynamic route**.

### The concept

Think about URLs you see on real websites:
- `/products/1`, shows product with ID 1
- `/products/42`, shows product with ID 42
- `/users/john`, shows John's profile

The pattern is the same: a fixed prefix (`/products/`) followed by a variable segment (the ID). In routing, you express this with a **route parameter**:

```
/products/:id
```

The `:id` part is a placeholder. It matches any value in that URL segment and makes it available to your component as a parameter. This is identical across frameworks:
- **Vue Router**: `/products/:id` → `route.params.id`
- **React Router**: `/products/:id` → `useParams().id`
- **Angular**: `/products/:id` → `ActivatedRoute.params`
- **Express** (your backend!): `/products/:id` → `req.params.id`


### Adding a getProduct helper to the composable

Before creating the detail page, add one small function to `src/composables/useProducts.ts`. Looking up a product by ID is a data operation, it belongs in the composable (in the actual `useProduct` method), not in a page component. Don't forgot to add it to the return object as well. 

```ts
function getProduct(id: number): Product | undefined {
  return products.value.find(p => p.id === id)
}
```


Page components should ask composables for what they need, they shouldn't reach into a ref and search it themselves. This is the same principle you applied in Lesson 3 when you moved `saveProducts` and `loadProducts` into the composable instead of calling `localStorage` directly from the component.

### Creating the detail page

Create `src/pages/ProductDetailPage.vue`:

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'

const route = useRoute()
const { getProduct } = useProducts()

const productId = Number(route.params.id)
const product = getProduct(productId)
</script>

<template>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>Price: ${{ product.price }}</p>
    <RouterLink to="/products">← Back to Products</RouterLink>
  </div>
  <div v-else>
    <h1>Product Not Found</h1>
    <p>No product exists with ID {{ productId }}.</p>
    <RouterLink to="/products">← Back to Products</RouterLink>
  </div>
</template>
```

**What's happening here?**

- `useRoute()` gives you access to the current route information. It's a composable provided by Vue Router, similar to how `useProducts()` is your own composable.
- `route.params.id` contains the value from the `:id` segment in the URL. **Important:** route params are always strings! If the URL is `/products/42`, then `route.params.id` is the string `"42"`, not the number `42`. That's why we wrap it with `Number()` to convert it.
- `getProduct(productId)` asks the composable for the matching product. If no product has that ID, it returns `undefined`.
- We use `v-if` / `v-else` to handle both cases: product found and product not found. A fallback is not optional; users will type invalid URLs, bookmark old pages, and share broken links. Always handle the missing case.

### Adding the route

Update your route table in `src/router/index.ts`. Add the detail route **after** the products list route:

```ts
import ProductDetailPage from '../pages/ProductDetailPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/products', component: ProductManagementPage },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/about', component: AboutPage },
]
```

The order matters here. Vue Router matches routes from top to bottom. Since `/products` is a static path, it gets checked first. `/products/:id` only matches when there's something after `/products/`. If you put the dynamic route first, navigating to `/products` might try to match `:id` as an empty parameter.

### Linking from the list to detail

Now you need to let users click a product to see its detail page. Open your `ProductCard.vue` and add a `RouterLink` to the product name:

```vue
<RouterLink :to="`/products/${product.id}`">{{ product.name }}</RouterLink>
```

Notice the `:to` with a colon; this binds the attribute to a JavaScript expression (template literal), just like `:key` or `:class`. Without the colon, you'd pass the literal string `/products/${product.id}` instead of the computed URL.

If your `ProductCard` doesn't have access to `product.id` as a single prop, adjust accordingly based on how your props are structured.

👉 **Exercise 3: Build the detail flow**\
Add the detail route and link products from the list to their detail pages. Test these scenarios:
1. Click a product in the list; the detail page shows with correct data
2. Manually type a URL with a valid ID; the detail page shows
3. Manually type a URL with an invalid ID like `/products/99999`; the "not found" fallback shows
4. Click "Back to Products"; you return to the list

> **Shared state.** Different pages are calling the `useProducts` composable. A new instance will get created for each page. If your `products` ref is declared outside the `useProducts()` method it will share it's state over different instances. If it's declared inside the method it will reload it for every instance, in our project that won't make a difference as it instanly loads and saves from the `LocalStorage`. In bigger applications a `state management` library like `Pinia` is used to manage these situations. 

---

## Not Found Route, Handling Unknown URLs

What happens when a user navigates to `/settings` or `/foo/bar`? Right now, nothing renders, `RouterView` stays empty because no route matches. That's confusing. Every professional app shows a "404 Not Found" page for unknown URLs.

### Creating the not found page

Create `src/pages/NotFoundPage.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <div>
    <h1>404, Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <RouterLink to="/">Go to Home</RouterLink>
  </div>
</template>
```

### Adding the catch-all route

In `src/router/index.ts`, add a catch-all route **at the very end** of the routes array:

```ts
import NotFoundPage from '../pages/NotFoundPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/products', component: ProductManagementPage },
  { path: '/products/:id', component: ProductDetailPage },
  { path: '/about', component: AboutPage },
  { path: '/:pathMatch(.*)*', component: NotFoundPage },
]
```

The `/:pathMatch(.*)*` syntax is a special Vue Router pattern that matches any URL that didn't match the routes above it. The `(.*)` is a regular expression matching any characters, and the outer `*` makes it match multiple path segments (so `/foo/bar/baz` also gets caught).

**This route must be last.** Since Vue Router matches from top to bottom, putting the catch-all anywhere else would prevent routes below it from ever matching.

👉 **Exercise 4: Test your not found page**\
Add the catch-all route and test by manually typing URLs that don't exist: `/settings`, `/foo`, `/products/abc/xyz`. All should show your not found page. Make sure your real routes still work too!

---

## Lazy Loading Routes

Right now, when your app loads, the browser downloads the code for *every* page component, even pages the user might never visit. For a small app, this doesn't matter. But imagine an app with 50 pages, loading all of them upfront wastes bandwidth and slows down the initial load.

**Lazy loading** solves this. Instead of importing a component at the top of the file (which bundles it into the initial load), you use a dynamic import that tells the build tool: "don't include this component in the main bundle. Load it only when someone navigates to this route."

**When to lazy load:**
- Pages users rarely visit (About, Settings, Terms)
- Heavy pages with lots of code or dependencies
- Admin sections that most users never access

**When NOT to lazy load:**
- The home page (users always see it first)
- Pages that are almost always visited

For your product catalog, the About page is a good candidate. The home page and products page should load eagerly since most users will visit them.

### Applying lazy loading

Update your `src/router/index.ts`. Remove the `AboutPage` import at the top and replacve it with this variable lazy loading the same page.
`const AboutPage = () => import('../pages/AboutPage.vue');`

That's it! The `import()` method will tell the Vue bundler to make seperate .js file for it that is only requested from the server when it is actually needed. 


👉 **Exercise 5: Lazy load and verify**\
Apply lazy loading to the About page. Open DevTools Network tab, navigate around, and confirm the About page code only loads when you click the About link. The app should work exactly the same from the user's perspective.

---


## Nested Routes and Module Navigation

A larger app may have several pages within one module, such as a products area with pages for managing products and viewing categories. A nested route lets those pages share a module layout, including a subnavigation bar.

The shared layout is a parent route component. Its `<RouterView />` is where the active child page appears. This is separate from the app-wide shell in App.vue: App.vue can provide the main navigation, while a module layout provides navigation specific to that module.

```ts
{
  path: '/products',
  component: ProductsLayout, //Parent layout with subnav
  children: [
    { path: '', component: ProductManagementPage },
    { path: 'categories', component: ProductCategoriesPage },
    { path: 'favorites', component: ProductFavoritesPage },
  ],
}
```

These child routes resolve to `/products`, `/products/categories`, and `/products/favorites`. The parent layout needs its own `<RouterView />`; Vue Router renders the active child page there:

```vue
<template>
  <nav>
    <RouterLink to="/products">Products</RouterLink>
    <RouterLink to="/products/categories">Categories</RouterLink>
    <RouterLink to="/products/favorites">Favorites</RouterLink>
  </nav>

  <RouterView />
</template>
```

The subnavigation stays visible as the child page changes. This is the same idea as the app-wide shell in `App.vue`, applied within one module. Use nested routes in your own project when a group of related pages benefits from a shared layout or subnavigation; URLs that look nested can also be defined as separate, flat routes when no shared layout is needed. We're not going to apply this in our lesson right now, but this might be useful for your own project module.

---

## Programmatic Navigation

Sometimes you need to navigate from code instead of from a template link. For example, after submitting a form, you might want to redirect the user to a different page. Or after deleting the last product, you might want to send them back to the home page. We're not gonna implement this right now but it might come in handy in your own project. 

Vue Router's `useRouter()` composable gives you this ability:

```ts
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigate to a path
router.push('/products')

// Go back (like pressing the browser's back button)
router.back()

// Replace current URL (no new history entry)
router.replace('/products')
```

The difference between `push` and `replace`:
- `router.push('/about')`, adds a new entry to the browser history. The user can press back to return.
- `router.replace('/about')`, replaces the current history entry. The user can't press back to the previous page.

Use `replace` for redirects (like after login) where going "back" to the login page doesn't make sense. Use `push` for regular navigation.

**Other frameworks do this similarly:**
- **React Router**: `useNavigate()` returns a `navigate` function
- **Angular**: Inject `Router` service and call `router.navigate()`

---

## Common Mistakes and How to Fix Them

**Links do nothing:** Check `src/main.ts` first. The router might not be registered, or it might be registered after `app.mount()`. The order is: `createApp` → `app.use(router)` → `app.mount()`.

**Navigation shows a blank page:** Check your route imports and path strings in `src/router/index.ts`. A typo in the `path` or a wrong import path for the component will silently fail.

**Detail pages can't find the product:** Remember that route params are always strings. If your product IDs are numbers, you must convert with `Number(route.params.id)`. Comparing `"42" === 42` is `false` in JavaScript!

**Refreshing a deep URL fails in production:** This is a server configuration issue. In development, Vite handles it automatically. In production, your server needs to return `index.html` for all routes so Vue Router can take over. Check the [Vue Router deployment docs](https://router.vuejs.org/guide/essentials/history-mode.html) for your specific server.

**Active link highlighting doesn't work:** Make sure you're using `RouterLink`, not `<a>` tags. Vue Router only adds the `.router-link-active` class to `RouterLink` components.

---

## Summary

You've added client-side routing to your app without rewriting any product logic. That's the power of good architecture, you built component communication in Lesson 4, and routing just added a new layer on top.

**Client-side routing** maps URLs to page components. The browser doesn't make server requests for navigation, JavaScript handles it by swapping components in a route outlet. This keeps the app fast and preserves state.

**Route configuration** is a lookup table: each record maps a `path` to a `component`. Vue Router matches routes top to bottom, so order matters. Static routes go before dynamic ones, and the catch-all goes last.

**RouterLink** replaces `<a>` tags in SPAs. It prevents full page reloads and lets Vue Router manage navigation, history, and active link state.

**Dynamic routes** use parameters (`:id`) to match variable URL segments. Route params are always strings, so convert them when you need numbers. Always handle the case where the resource isn't found.

**Lazy loading** with `() => import(...)` delays loading page code until the user actually navigates there. Use it for pages that aren't visited on every session.

These patterns apply to every frontend framework. React Router, Angular Router, and SvelteKit all have route tables, route outlets, link components, dynamic segments, and lazy loading. The syntax changes, the concepts don't.

---

## Practical Exercises

👉 **Easy: Add a category filter to the URL**\
Add a route like `/products/category/:category` that filters the product list by category. This teaches you that route params aren't just for IDs, they represent any meaningful URL state.

👉 **Medium: Add breadcrumb navigation**\
Create a simple breadcrumb component that shows the current path (e.g., Home > Products > Product Name). Use `useRoute()` to read the current path and params. Display it below the nav bar in `App.vue`.

👉 **Hard: Add navigation guards**\
Vue Router supports `beforeEach` guards that run before every navigation. Add a guard that logs every route change to the console (from which path to which path). Then extend it to prevent navigation away from the product form when there are unsaved changes. Check the [Vue Router navigation guards docs](https://router.vuejs.org/guide/advanced/navigation-guards.html) for syntax.

---

## Thought Questions

💡 **Conceptual Understanding**

- Why should page location live in the URL instead of component state? What breaks when you store "which page is active" in a `ref` instead of the URL?

- Why does `RouterLink` exist when `<a>` tags already handle navigation? What would go wrong if you used regular anchor tags throughout your SPA?

- Why is it important that you added routing without rewriting product business logic? What does this tell you about separation of concerns?

- When is a dynamic route parameter (like `/products/:id`) a better fit than a query string (like `/products?id=42`)?

- What's the tradeoff with lazy loading routes? Why wouldn't you lazy load every single route?

---
