export function Icon({ name, weight = 'regular', size = 24, className = '' }) {
    return i({
        class: `ph ${weight === 'fill' ? 'ph-fill ' : ''} ph-${name} text-slate-600 inline-block align-middle ${className}`.trim(),
        style: `font-size: ${size}px`,
    });
}

export function Heading({ text, className = '' }) {
    return h2({ class: `text-2xl font-semibold text-slate-900 tracking-tight mb-4 ${className}` }, text);
}

export function Subheading({ text, className = '' }) {
    return h3({ class: `text-lg font-medium text-slate-800 mb-2 ${className}` }, text);
}

export function Paragraph({ text, className = '' }) {
    return p({ class: `text-slate-600 leading-relaxed mb-3 ${className}` }, text);
}

export function Label({ text, htmlFor, className = '' }) {
    return label({ for: htmlFor, class: `block text-sm font-medium text-slate-700 mb-1 ${className}` }, text);
}

export function Container({ children, className = '', style = '' }) {
    return div({
        class: `w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`, style
    }, ...(Array.isArray(children) ? children : [children]));
}

export function Section({ children, className = '' }) {
    return section({ class: `py-6 w-full break-words ${className}` }, ...(Array.isArray(children) ? children : [children]));
}

export function Card({ content, className = '' }) {
    return div({
        class: `${className}`
    }, ...(Array.isArray(content) ? content : [content]));
}

export function Box({ children, className = '', style = '' }) {
    return div({ class: className, style }, ...(Array.isArray(children) ? children : [children]));
}

export function CenterBox({ children, className = '' }) {
    return div({ class: 'flex items-center justify-center min-h-screen bg-slate-50' },
        div({
            class: `bg-white shadow-md rounded-lg p-8 w-full max-w-md ${className}`
        }, ...(Array.isArray(children) ? children : [children]))
    );
}

export function Divider({ className = '' } = {}) {
    return hr({ class: `my-6 border-t border-slate-200 ${className}` });
}

export function Button({ text, onClick, className = '', type = 'button' }) {
    return button({
        type,
        onclick: onClick,
        class: `bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition ${className}`
    }, text);
}

export function Link({ href, text, onClick, className = '' }) {
    return a({ href, onclick: onClick, class: `text-indigo-600 hover:underline transition ${className}` }, text);
}

export function Input({ value, onInput, placeholder = '', className = '', type = 'text', ...props }) {
    return input({
        type,
        value,
        placeholder,
        oninput: onInput,
        class: `block w-full border border-slate-300 rounded-md px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${className}`,
        ...props
    });
}

export function List({ items, className = '' }) {
    return ul({
        class: `list-disc ml-4 space-y-1 text-slate-700 ${className}`
    }, ...items.map(item => li({}, item)));
}

export function ListItem({ children, className = '' }) {
    return li({ class: `text-slate-700 ${className}` }, children);
}

export function Navbar({ links = [], className = '', title = 'MyApp', icon = 'logo' }) {
    const [open, setOpen] = useState(false);

    return nav({ class: `bg-white border-b border-slate-200 px-4 py-3 flex items-center w-full mb-8 justify-between ${className} relative` },

        div({ class: 'flex items-center flex-shrink-0' },
            Icon({ name: icon, size: 28, className: 'mr-2 text-indigo-500' }),
            h1({ class: 'text-lg font-semibold text-slate-800' }, title)
        ),

        button({
            class: 'md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500',
            'aria-label': 'Toggle menu', onclick: () => setOpen(!open)
        },
            Icon({ name: open ? 'x' : 'list', size: 24, className: 'text-slate-700' })
        ),

        ul({ class: `hidden md:flex gap-6 items-center justify-center flex-1` },
            ...links.map(link =>
                li({},
                    a({ href: link.href, class: 'flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium', title: link.label },
                        link.icon ? Icon({ name: link.icon, size: 20 }) : null,
                        link.label
                    )
                )
            )
        ),
        open ? div({ class: 'absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-md md:hidden z-10' },
            ul({ class: 'flex flex-col py-2' },
                ...links.map(link =>
                    li({ onClick: () => setOpen(false) },
                        a({ href: link.href, class: 'flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition font-medium', title: link.label },
                            link.icon ? Icon({ name: link.icon, size: 20 }) : null,
                            link.label
                        )
                    )
                )
            )
        ) : div({}, '')
    );
}

export function Image({ src, alt = '', className = '' }) {
    return img({ src, alt, class: `rounded-md shadow-sm ${className}` });
}