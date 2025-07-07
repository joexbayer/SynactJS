/** @jsx h */

// === Icon ===
export function Icon({ name, weight = 'regular', size = 24, className = '' }) {
    return i({
        class: `ph ${weight === 'fill' ? 'ph-fill ' : ''} ph-${name} text-gray-700 inline-block align-middle ${className}`.trim(),
        style: `font-size: ${size}px`,
    });
}

// === Typography ===
export function Heading({ text, className = '' }) {
    return h2({ class: `text-2xl font-semibold text-gray-900 tracking-tight mb-4 ${className}` }, text);
}

export function Subheading({ text, className = '' }) {
    return h3({ class: `text-lg font-medium text-gray-800 mb-2 ${className}` }, text);
}

export function Paragraph({ text, className = '' }) {
    return p({ class: `text-gray-600 leading-relaxed mb-3 ${className}` }, text);
}

export function Label({ text, htmlFor, className = '' }) {
    return label({ for: htmlFor, class: `block text-sm font-medium text-gray-700 mb-1 ${className}` }, text);
}

// === Layout ===
export function Container({ children, className = '' }) {
    return div({
        class: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`
    }, ...(Array.isArray(children) ? children : [children]));
}

export function Section({ children, className = '' }) {
    return section({ class: `py-6 ${className}` }, ...(Array.isArray(children) ? children : [children]));
}

export function Card({ content, className = '' }) {
    return div({
        class: `bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`
    }, ...(Array.isArray(content) ? content : [content]));
}

export function Box({ children, className = '' }) {
    return div({ class: className }, ...(Array.isArray(children) ? children : [children]));
}

export function CenterBox({ children, className = '' }) {
    return div({ class: 'flex items-center justify-center min-h-screen bg-gray-50' },
        div({
            class: `bg-white shadow-md rounded-lg p-8 w-full max-w-md ${className}`
        }, ...(Array.isArray(children) ? children : [children]))
    );
}

export function Divider({ className = '' } = {}) {
    return hr({ class: `my-6 border-t border-gray-300 ${className}` });
}

// === Buttons & Links ===
export function Button({ text, onClick, className = '', type = 'button' }) {
    return button({
        type,
        onclick: onClick,
        class: `bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition ${className}`
    }, text);
}

export function Link({ href, text, className = '' }) {
    return a({ href, class: `text-blue-600 hover:underline transition ${className}` }, text);
}

// === Inputs ===
export function Input({ value, onInput, placeholder = '', className = '', type = 'text', ...props }) {
    return input({
        type,
        value,
        placeholder,
        oninput: onInput,
        class: `block w-full border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 ${className}`,
        ...props
    });
}

// === Lists ===
export function List({ items, className = '' }) {
    return ul({
        class: `list-disc list-inside space-y-1 text-gray-700 ${className}`
    }, ...items.map(item => li({}, item)));
}

export function ListItem({ children, className = '' }) {
    return li({ class: `text-gray-700 ${className}` }, children);
}

// === Navbar ===
export function Navbar({ links = [], className = '', title = 'MyApp' }) {
    return nav({
        class: `bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between ${className}`
    },
        h1({ class: 'text-lg font-semibold text-gray-800' }, title),
        ul({ class: 'flex gap-6' },
            ...links.map(link =>
                li({},
                    a({ href: link.href, class: 'text-gray-600 hover:text-blue-600 transition font-medium' }, link.label)
                )
            )
        )
    );
}

// === Images ===
export function Image({ src, alt = '', className = '' }) {
    return img({ src, alt, class: `rounded-md shadow-sm ${className}` });
}