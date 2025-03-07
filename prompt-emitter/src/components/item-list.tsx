import { Children, For } from "@alloy-js/core";

interface ItemListProps<T> {
  items: Map<string | symbol, T> | T[];
  render: (t: T) => Children;
}

export function ItemList<T extends object>(props: ItemListProps<T>) {
  if (Array.isArray(props.items)) {
    if (props.items.length === 0) {
      return <>{"[]"}</>;
    }
  } else {
    if (props.items.size === 0) {
      return <>{"{}"}</>;
    }
  }

  const items = Array.isArray(props.items)
    ? props.items
    : Array.from(props.items.values());

  return (
    <For each={items} hardline>
      {(item) => {
        return props.render(item);
      }}
    </For>
  );
}
