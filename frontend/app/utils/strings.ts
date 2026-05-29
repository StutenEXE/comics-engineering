import React from "react";

export function insertLinebreaks(str: string) {
    return str.split("\n").map((line, i) => React.createElement("span", { key: i }, line, React.createElement("br")));
}

export function capitalize(str: string) {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
}

export function formatToIsbn(digits: string) {
    let isbn = `${digits.slice(0,3)}`
    // ISBN-13: 978-3-16-148410-0
    if (digits.length < 3) return isbn
    isbn = `${isbn}-${digits.slice(3,4)}`
    if (digits.length < 4) return isbn
    isbn = `${isbn}-${digits.slice(4,6)}`
    if (digits.length < 6) return isbn
    isbn = `${isbn}-${digits.slice(6,12)}`
    if (digits.length < 12) return isbn
    isbn = `${isbn}-${digits.slice(12)}`
    return isbn;
    // ISBN-10: 0-306-40615-2
    // return `${digits.slice(0,1)}-${digits.slice(1,4)}-${digits.slice(4,9)}-${digits.slice(9)}`;
}