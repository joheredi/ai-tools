import { Children, For } from "@alloy-js/core";
import { JsonArray } from "@alloy-js/json";

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
    <JsonArray>
      <For each={items} hardline comma>
        {(item) => {
          return props.render(item);
        }}
      </For>
    </JsonArray>
  );
}
