import { Type } from "@typespec/compiler";
import { $ } from "@typespec/compiler/experimental/typekit";
import { useTypes } from "../context/types-context.jsx";

export interface TypeIdProps {
    type: Type;
}

export function TypeId({ type }: TypeIdProps) {
    const {trackType} = useTypes();
    if($.type.isUserDefined(type)) {
        const typeId = trackType(type)
        return <>[typeId: {typeId}]</>;
    }
    return null;
}