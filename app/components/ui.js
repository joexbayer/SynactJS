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
export function Button({ text, onClick, className = '', type = 'button' }) {
    return button({ type, class: `bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${className}`, onclick: onClick }, text);
}

export function Input({ value, onInput, placeholder = '', className = '', type = 'text', ...props }) {
    return input({
        type,
        value,
        placeholder,
        class: `border rounded px-3 py-2 mb-2 ${className}`,
        oninput: onInput,
        ...props
    });
}

export function Label({ text, htmlFor, className = '' }) {
    return label({ for: htmlFor, class: `block text-gray-700 font-medium mb-1 ${className}` }, text);
}

export function Divider({ className = '' }) {
    return hr({ class: `my-4 border-gray-300 ${className}` });
}

export function Section({ children, className = '' }) {
    return section({ class: `mb-6 ${className}` }, ...(Array.isArray(children) ? children : [children]));
}