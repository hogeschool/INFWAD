# Lesson 4: Component Communication - Props and Events

**Duration:** 2 hours\
**Prerequisites:** Lesson 1-3 (Reactivity, Two-Way Binding, Lifecycle Hooks)

## What You'll Learn

Your App.vue is growing. It handles the form, displays the product list, manages state, and coordinates everything. That's too much responsibility for one component. In real applications, you split your UI into smaller, reusable components that communicate with each other.

In this lesson, you'll learn the universal pattern of component communication: **parents pass data down via props, children send events up via emits**. This pattern exists in every component-based framework: React, Angular, Svelte, Vue. Master it here, and you understand it everywhere.

By the end, your app will be organized into multiple components that work together through props and events.

---

## Component Communication: The Universal Pattern

Here's how component communication works in every framework:

**Data flows down:** Parents pass data to children via **props** (properties). The child receives the data but cannot modify it directly. Props are read-only from the child's perspective.

**Events flow up:** Children notify parents of actions via **events** (emits). The child says "something happened" and the parent decides what to do about it.

This creates a predictable data flow:
```
Parent Component
  ↓ props (data down)
Child Component
  ↑ events (actions up)
```

React calls this "props down, events up." Angular uses Input/Output. Svelte has props and dispatch. Vue uses props and emits. Same pattern, slightly different names.

---

## Creating ProductManagementPage

Professional applications organize code into layers:
- **App.vue** - the shell (navigation, layout)
- **Page components** - features (ProductManagementPage, AboutPage)
- **UI components** - reusable pieces (ProductForm, ProductList)

Let's start by extracting your products feature into a page component. We'll call it ProductManagementPage since it handles CRUD operations (in the next lesson, we'll create other pages like ProductDetailPage for viewing).

👉 **Task: Create ProductManagementPage**

1. Create folder `src/pages`
2. Create `ProductManagementPage.vue` and move your entire App.vue content there (script, template, styles)
3. Adjust imports in ProductManagementPage - composables path changes from `./composables/` to `../composables/`
4. Update App.vue to just import and render ProductManagementPage:

```vue
<script setup lang="ts">
import ProductManagementPage from './pages/ProductManagementPage.vue'
</script>

<template>
  <ProductManagementPage />
</template>
```

**Test:** Everything should work exactly the same. You've just organized your code without changing functionality.

---

## Extracting ProductForm Component

Your form is mixed in with ProductManagementPage. Let's extract it into a reusable component.

👉 **Task: Create ProductForm Component**

**Create** `src/components/ProductForm.vue`:
- Copy form-related refs from ProductManagementPage: `newProductName`, `newProductPrice`
- Copy the form template (the `<form>` element and everything inside it)
- Copy any styles related to the form

**Add event emitting:**
- Import and use `defineEmits`:
  ```ts
  const emit = defineEmits<{
    add: [name: string, price: number]
  }>()
  ```

Emits custom events defined in the child component to allow it to communicate with its parent. It's like defining, for this component to work, the parent component needs to be able to handle this `add` action on its behalf. This keeps the logic in the *page* while the *components* focus on displaying content. By structuring it this way, you can easily reuse the same component in different places where entirely different logic might be required for that same action.

- Create `handleSubmit()` function that validates input, then emits: `emit('add', newProductName.value, newProductPrice.value)`

```ts
function handleSubmit() {
    if (newProductName.value.trim() === '' || newProductPrice.value <= 0) {
        alert('Please enter valid product details')
        return
    }
    emit('add', newProductName.value, newProductPrice.value)
}
```

- Adjust the form opening tag to ` <form @submit.prevent="handleSubmit">`

**Use in ProductManagementPage:**
- Import ProductForm
- Replace your form template with `<ProductForm @add="handleAdd" />`
- Create `handleAdd(name: string, price: number)` that calls `addProduct(name, price)` from composable
- Remove the form-related refs from ProductManagementPage (they're now in ProductForm)

**Test:** Adding products should work. Editing doesn't work yet, that's next.

---

## Props: Passing Data to Children

Your form can add products, but can't edit them yet. To edit, ProductForm needs to know what product is being edited. The parent (ProductManagementPage) must pass this data down using **props**.

### The editingId Problem

Right now, you track `editingId` (a number). To pass editing data to ProductForm, you'd need to pass the editingId as a prop. The ProductForm would need the entire products array to look it up. Meaning the ProductForm is tightly coupled to the parent's data structure. This conflicts with our *separation of concerns*. 

To fix this we will not track the `editingId` but the actual object `editingProduct` (the full Product object or null). To further separate the logic we're going to track this in the page, not in the composable. Keeping the composable pure for handling the storage of the Product objects. 

👉 **Task: Refactor to editingProduct**

**In your composable (`useProducts.ts`):**
- Remove the `editingId` ref and its reference in the return statement
- Update `updateProduct()` to accept and handle a full Product object instead of id/name/price

**In ProductManagementPage:**
- Add a new ref `editingProduct` (type: `ref<Product | null>`)
- Don't forget to give your new ref directly a value `..(null)`
- Create workflow functions:
  ```ts
  function startEditing(product: Product) {
    editingProduct.value = product
  }
  
  function cancelEdit() {
    editingProduct.value = null
  }
  ```
- Update `handleUpdate` to pass full product object to composable, then call `cancelEdit()`


## Adding a type

Now we start passing the Product object around we would like to have that type defined everywhere. We don't want to define the type in every file again. That's why we going to create one definition of it and import it everywhere else. 

Create the folder `src/types/`, add a new file `Product.ts` to that folder. In the file define and export the Product interface. 
```TS
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

Now remove this interface from your composable, the page, component and import it instead. Note we use `import type` as we are only importing a type.
```ts
import type { Product } from '../types/Product'
```

## Adding Props to ProductForm

Define the props in `ProductForm`.
  ```ts 
  const props = defineProps<{
    editingProduct: Product | null
  }>()
  ```

Props are variables which the child component needs to receive from its parent component in order to function. Props are reactive, meaning the DOM will rerender if the parent component changes them. But props are read-only, meaning the child component cannot change them. 

Props being read-only gives us an issue with the edit functionality. We cannot edit the `editingProduct` prop. We will have to copy the values from the `editingProduct` into our refs. We can do this using Lifecycle Hooks from the previous lesson (`onMounted`) but this won't update our refs if the prop is changed during the child components lifetime, this is not what we want. We want a `watcher` from our previous lesson. Props are reactive so we can *watch* them and adjust our refs when the `editingProduct` changes.

Create the watch method
```ts
import { watch } from 'vue'

watch(() => props.editingProduct, (product) => {
  if (product) {
    newProductName.value = product.name
    newProductPrice.value = product.price
  } else {
    newProductName.value = ''
    newProductPrice.value = 0
  }
}, { immediate: true })
```
Remember why this will update our form directly? Our form has `v-model` on the inputs. Two-way binding from lesson 2. Meaning the input and the ref will sync. 



Update heading in the template:

```<h2>{{ props.editingProduct ? 'Edit Product' : 'Add Product' }}</h2>```

Update emits to include update and cancel:
  ```ts
  const emit = defineEmits<{
    add: [name: string, price: number]
    update: [product: Product]
    cancel: []
  }>()
  ```

Modify `handleSubmit()` to check if editing and emit appropriate event:
  ```ts
  if (props.editingProduct) {
    // create new product, never adjust the props
    const updated: Product = {
      id: props.editingProduct.id,
      name: newProductName.value,
      price: newProductPrice.value
    }
    emit('update', updated)
  } else {
    emit('add', newProductName.value, newProductPrice.value)
  }
  ```

**In ProductManagementPage:**
- Pass the prop and listen to events:
  ```vue
  <ProductForm 
    :editing-product="editingProduct"
    @add="handleAdd"
    @update="handleUpdate"
    @cancel="cancelEdit"
  />
  ```
- Create handlers:
  ```ts
  function handleUpdate(product: Product) {
    updateProduct(product)
    cancelEdit()
  }
  ```

**Test:** Editing should now work! Click edit on a product, modify it, submit.

**What you learned:** Props pass data down (read-only), events send actions up. Children never mutate props directly.

---

## Extracting ProductList Component

Your ProductManagementPage still contains the product list template. Let's extract that too, demonstrating **nested components** and **event re-emitting**. Using the knowledge from the earlier part of this lesson you should be able to do this by yourself now!

👉 **Task: Create ProductList Component**

Adjust `ProductCard` props to receive one product object instead of the three fields. 

**Create** `src/components/ProductList.vue`:
- **Props:** Accept `products` (array of Product)
- **Events:** Emit `edit` and `delete` events
- **Template:**
  - You should be able to copy most of this from the ProductManagementPage.
  - Loop with `v-for` over products
  - Pass prop to each ProductCard: `:product="product"`
  - Listen to ProductCard events and **re-emit** them:
    ```ts
    <ProductCard
      @edit="emit('edit', product)"
      @delete="emit('delete', product.id)"
    />
    ```
  - You could also write new handler functions for these events and emit in there, instead of emit directly. Up to you. 
  - Show "No products yet" message when list is empty
  - Apply your grid/list styling

**In ProductManagementPage:**
- Import ProductList
- Replace product list template with:
  ```ts
  <ProductList 
    :products="products"
    @edit="startEditing"
    @delete="deleteProduct"
  />
  ```

**Test:** Everything should still work. Events bubble: ProductCard → ProductList → ProductManagementPage.

**Pattern observation:** ProductList doesn't render products itself, it delegates to ProductCard. This is **composition**: building complex components from simpler ones. ProductList coordinates, ProductCard displays.

---

👉 **Exercise: Add Cancel Button**

Add a cancel button to ProductForm that only appears when editing. Call `emit('cancel')` when clicked. This gives users a visual way to exit edit mode.

---

👉 **Exercise: Lifecycle Hooks in Action**

Previous lesson we created a keyboard shortcut to escape editing a product. We did this to demonstrate the lifecycle hooks. These are still in our ProductManagementPage. The *edit state* is owned by the page with `editingProduct` ref, meaning a way to cancel it would be owned by the page as well. No need to move this to the form component. 

Now it is in the page we can see it in action! Add a toggle button in App.vue that shows/hides ProductManagementPage with `v-if`. Watch console logs when toggling.

---

## Component Architecture Summary

You've reorganized your app into a clear hierarchy:

```
App.vue (shell)
  └─ ProductManagementPage (coordinator)
      ├─ ProductForm (UI component)
      └─ ProductList (container component)
          └─ ProductCard (UI component)
```

**Key patterns:**
- **Props down, events up** - universal across all frameworks
- **Page coordinates, components specialize** - ProductManagementPage handles workflow, components handle UI
- **Composable provides data** - keeps business logic separate from UI
- **Event re-emitting** - ProductList passes events from ProductCard up to ProductManagementPage

---

## Best Practices

- **Single Responsibility:** Each component does one thing
- **Props are read-only:** Never mutate props in children
- **Emit events for actions:** Children don't change parent state directly
- **Naming:** Files are PascalCase (`ProductForm.vue`), props in templates are kebab-case (`:editing-product`), events are kebab-case (`@add-product`)

---

## Practical Exercises

👉 **Easy: Add Total Value Display**\
Create a computed property in ProductList that calculates total value. Display it at the bottom. The component receives products as a prop, so compute from that.


👉 **Hard: Create ConfirmDialog Component**\
Build a reusable `ConfirmDialog.vue` with props for `message` and `show` (boolean), events for `confirm` and `cancel`. Use it in ProductManagementPage to confirm before deleting. This teaches conditional rendering with props.

---

## Thought Questions

💡 **Conceptual Understanding**

- Why can't children modify props directly? What problems would that cause?

- When should state live in a child vs. the parent? What's the tradeoff?

- What happens if you emit an event but no parent is listening? Is that an error?
