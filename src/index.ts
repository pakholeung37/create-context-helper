import React, { useMemo, useRef } from 'react'

export const createContextHelper = <
  ContextType,
  ProviderProps extends Partial<ContextType> = Partial<ContextType>,
>(
  prefix: string,
  defaultValue: ContextType,
): [React.FC<ProviderProps>, () => ContextType, React.Context<ContextType>] => {
  const Context = React.createContext<ContextType>(defaultValue)
  Context.displayName = prefix + 'Context'
  const Provider: React.FC<ProviderProps> = props => {
    const value = useMemo(() => ({ ...defaultValue, ...props }), [props])
    return React.createElement(Context.Provider, {
      value,
      children: props.children,
    })
  }
  const useContext = (): ContextType => {
    const context = React.useContext(Context)
    if (!context) {
      throw new Error(`use${prefix} must be used within a ${prefix}Provider`)
    }
    return context
  }
  return [Provider, useContext, Context]
}

export const createAtomicContextHelper = <
  ContextType extends { [s: string]: any },
  ProviderProps extends Partial<ContextType> = Partial<ContextType>,
  K extends keyof ContextType = keyof ContextType,
>(
  prefix: string,
  defaultValue: ContextType,
): [
  React.FC<ProviderProps>,
  <T extends K[] = K[]>(selector?: T) => Pick<ContextType, T[number]>,
  Record<keyof ContextType, React.Context<ContextType[string]>>,
] => {
  const ContextMap: Record<
    keyof ContextType,
    React.Context<ContextType[string]>
  > = Object.entries(defaultValue).reduce((acc, [key, value]) => {
    const Context = React.createContext<typeof value>(value)
    Context.displayName = prefix + 'Context.' + key
    return {
      ...acc,
      [key]: Context,
    }
  }, {} as Record<keyof ContextType, React.Context<ContextType[string]>>)

  const Provider: React.FC<ProviderProps> = props => {
    const { children, ...restProps } = props
    const value: ContextType = { ...defaultValue, ...restProps }
    return Object.entries(ContextMap).reduce((acc, [key, Context]) => {
      return React.createElement(
        Context.Provider,
        {
          value: value[key],
        },
        acc,
      )
    }, children as React.ReactElement)
  }
  Provider.displayName = prefix + 'Provider'

  const useContext = <T extends K[] = K[]>(
    selector?: T,
  ): Pick<ContextType, T[number]> => {
    const selectorRef = useRef(selector)

    if (JSON.stringify(selectorRef.current) !== JSON.stringify(selector)) {
      console.error(
        `${prefix}Context.useContext: selector has been changed which is not allowed.`,
      )
    }
    selector = selectorRef.current
    if (!selector) {
      selector = Object.keys(defaultValue) as T
    }
    const value = selector.reduce((acc, p) => {
      const context = ContextMap[p]
      if (!context) {
        console.error(`${prefix}Context.${p} is not defined`)
        return {
          ...acc,
          [p]: undefined,
        }
      }
      return {
        ...acc,
        [p]: React.useContext(context),
      }
    }, {} as Pick<ContextType, T[number]>)

    return value
  }
  return [Provider, useContext, ContextMap]
}
