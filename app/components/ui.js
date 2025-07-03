export function Card({ content, className = '' }) {
    return div({ class: `bg-white shadow rounded p-6 ${className}` }, ...(Array.isArray(content) ? content : [content]));
}

export function Heading({ text, className = '' }) {
    return h3({ class: `text-xl font-bold mb-4 ${className}` }, text);
}

export function Paragraph({ text, className = '' }) {
    return p({ class: `text-gray-700 mb-2 ${className}` }, text);
}

export function PostTitle({ text, className = '' }) {
    return strong({ class: `block text-lg font-semibold mb-1 ${className}` }, text);
}
