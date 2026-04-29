
export function noPropagationEvt<E extends React.BaseSyntheticEvent>(evt?: (callback: E) => void) {
    return (e: E) => {
        e.stopPropagation();
        evt?.(e);
    };
}

export function preventDefaultEvt<E extends React.BaseSyntheticEvent>(evt?: (callback: E) => void) {
    return (e: E) => {
        e.preventDefault();
        evt?.(e);
    };
}