import { Children, shallowReactive, refkey, Refkey } from "@alloy-js/core";
import { TypesContext } from "../context/types-context.jsx";
import { Type } from "@typespec/compiler";

export interface TypesProviderProps {
  children?: Children;
}
export function TypesProvider(props: TypesProviderProps) {
  const types: Set<Type> = shallowReactive(new Set());
  const typeIdMap = new Map<string, Type>();
  const trackType = (type: Type): string => {
    const key = refkey(type);
    typeIdMap.set(key.key, type);
    return key.key;
  }
  const getTypeById = (id: string): Type | undefined => {
    return typeIdMap.get(id);
  }

  return (
    <TypesContext.Provider value={{ types, trackType, getTypeById }}>
      {props.children}
    </TypesContext.Provider>
  );
}
