import type { MouseEvent } from "react";

export function noPropagationEvt(evt?: () => void) {
    return (e: MouseEvent) => {
        e.stopPropagation();
        evt && evt();
    };
}