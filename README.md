# Create Context Helper

Create react context especially atomic context without painless.

With Atomic Context your component will only re-render based on atomic value changes but not the whole value you provide in a common pattern. It's simple to use and more powerful. [check](#createAtomicContextHelper)

[![NPM](https://nodei.co/npm/create-context-helper.png)](https://npmjs.org/package/create-context-helper/)

## Install

```bash
$ yarn add create-context-helper
# or
$ npm i create-context-helper
```

## Usage

This library provide `createContextHelper` to create a common pattern Context And `createAtomicContextHelper` to create atomic Context.

### createContextHelper

```typescript
import { createContextHelper } from 'create-context-helper'

const [FooBarProvider, useFooBar] = createContextHelper<{
  foo: string
  bar: string
}>('FooBar', {
  foo: '',
  bar: '',
})

const App = () => {
  return (
    <FooBarProvider foo={'hello'} bar={'world'}>
      <Comp />
    </FooBarProvider>
  )
}

const Comp = () => {
  const { foo, bar } = useFoo()
  return (
    <div>
      {foo} {bar} // hello world
    </div>
  )
}
```

### createAtomicContextHelper

```typescript
import { createAtomicContextHelper } from 'create-context-helper'

const [FooBarProvider, useFooBar] = createAtomicContextHelper<{
  foo: string
  bar: string
}>('FooBar', {
  foo: '',
  bar: '',
})

const App = () => {
  return (
    <FooBarProvider foo={'hello'} bar={'world'}>
      <Comp />
    </FooBarProvider>
  )
}

const Comp = () => {
  const { foo } = useFooBar(['foo'])
  return <div>{foo} // hello</div>
}
```

Simple as `createContextHelper`, but more powerful. Your context now becomes atomic which means now taking `useFoo(['foo'])` for value `foo`, the component will only change when `foo` changes.

`createAtomicContextHelper` will generate a provider tree for you like this

```typescript
<FooBarProvider>
  <FooBar.foo.Provider>
    <FooBar.bar.Provider>
      <Comp />
    </FooBar.bar.Provider>
  </FooBar.foo.Provider>
</FooBarProvider>
```

And with selector `['foo']` in hook `useFooBar`, the `FooBarProvider` will only collects `FooBar.foo.Context` for you. which means `<Comp />` only re-render when `foo` changes.

## Reference

```typescript
export const createContextHelper = <
  ContextType,
  ProviderProps extends Partial<ContextType> = Partial<ContextType>,
>(
  // prefix for provider displayName
  prefix: string,
  // context defaultValue
  defaultValue: ContextType,
): [
  // provider
  React.FC<ProviderProps>,
  // use hook
  () => ContextType,
  // context
  React.Context<ContextType>
]

export const createAtomicContextHelper = <
  ContextType extends { [s: string]: any },
  ProviderProps extends Partial<ContextType> = Partial<ContextType>,
  K extends keyof ContextType = keyof ContextType,
>(
  // prefix for provider displayName
  prefix: string,
  // context defaultValue
  defaultValue: ContextType,
): [
  // provider
  React.FC<ProviderProps>,
  // use hook
  <T extends K[] = K[]>(selector?: T) => Pick<ContextType, T[number]>,
  // contextMap
  Record<keyof ContextType, React.Context<ContextType[string]>>,
]

```

## Limitation

There is no magic in `createAtomicContextHelper`, It only separates shallow values in the original Provider into smaller providers. Inside `createAtomicContextHelper`, it calls `useContext` conditional depends on selector. So dynamic selector is not allowed. if don't, it will cause a serious render problem(`createAtomicContextHelper` handles this scenario by using the first selector).

## License

[MIT](LICENSE)
