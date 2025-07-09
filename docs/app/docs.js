import { Container, Section, Card, Heading, Paragraph, Divider, Box, Link } from './components/ui.js';
const docsSections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'install', title: 'Installation' },
    { id: 'usage', title: 'Usage' },
    { id: 'api', title: 'API Reference' },
    //{ id: 'examples', title: 'Examples' }
];


function Content() {

    const [selectedSection, setSelectedSection] = useState(docsSections[0].id);

    function Menu() {
        const menuItems = docsSections.map(section =>

            Link({
                href: `#${section.id}`, text: section.title,
                className: `block py-2 px-4 rounded ${selectedSection == section.id ? 'bg-gray-200 font-semibold' : ''}`,
                onClick: (e) => {
                    e.preventDefault();
                    setSelectedSection(section.id);
                }
            })
        );

        return Box({
            className: 'menu hidden sm:block',
            style: 'border-right: 1px solid #eee; padding: 2rem 1rem; position: sticky; top: 0; min-width: 180px;',
            children: menuItems
        });
    }

    let allContent = docsSections.map(section => {
        return Section({
            id: section.id,
            className: `section ${selectedSection == section.id ? 'active' : ''}`,
            children: [
                Heading({ text: section.title }),
                Paragraph({ text: `Content for ${section.title}.` }),
                Divider(),
                Paragraph({ text: `This is where you would put detailed information about ${section.title}.` })
            ]
        });
    });
    let content;
    switch (selectedSection) {
        case 'intro':
            content = [
                Heading({ text: 'Introduction' }),
                Paragraph({ text: 'Welcome to the SynactJS documentation. Here you will find everything you need to get started.' })
            ];
            break;
        case 'install':
            content = [
                Heading({ text: 'Installation' }),
                Paragraph({ text: 'Install SynactJS easily without any server or build tools. Just include it directly in your HTML using a CDN:' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        '<script type="module" src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>'
                    ]
                }),
                Paragraph({ text: 'That’s it! No npm install, no bundlers, no configuration required.' })
            ];
            break;
        case 'usage':
            content = [
                Heading({ text: 'Usage' }),
                Paragraph({ text: 'SynactJS is a lightweight, browser-only UI framework inspired by React. It is ideal for small projects, quick experiments, or enhancing static/server-rendered pages.' }),
                Heading({ text: 'Mounting Components with data-component', level: 2 }),
                Paragraph({ text: 'To mount a component, simply add an element in your HTML with a data-component attribute set to your component’s name. SynactJS will automatically find these elements and render the corresponding component inside them.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-html' },
                                `<!-- index.html -->
<div data-component="MyComponent"></div>
`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'In your JavaScript, define and register the component. SynactJS will mount it to every matching data-component element:' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// main.js
function MyComponent() {
    return h('div', null, 'Hello from MyComponent!');
}
SynactJS.register(MyComponent);`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'You can also pass props to your component using the data-prop attribute as a JSON string.' }),

                Paragraph({ text: 'Important: When using a functional component (especially one that uses state or useEffect), you must wrap it with h(Component, props) when rendering it inside another component. For example:' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// Correct usage inside another component
function Parent() {
    return h(ChildComponent, { someProp: 123 });
}`.trim())
                        )
                    ]
                }),
                Paragraph({
                    text: 'This ensures the component lifecycle (state, effects, etc.) works as expected.'
                }),

                Heading({ text: 'Example: Counter Component', level: 2 }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-html' },
                                `<!-- index.html -->
<div data-component="Counter" data-prop='{"label":"Counter A"}'></div>
<script>
function Counter({ label = 'Counter' }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(\`[\${label}] count is now \${count}\`);
    }, [count]);

    return button({
        class: 'bg-blue-600 text-white p-2',
        onClick: () => setCount(count + 1)
    }, \`Click Me \${count} (\${label})\`);
}

SynactJS.register(Counter);
</script>`.trim())
                        )
                    ]
                }),
                Heading({ text: 'JSX & Babel Usage', level: 2 }),
                Paragraph({ text: 'You can use SynactJS with Babel and JSX for a React-like experience. Remember to add /** @jsx h */ at the top of your file.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-html' },
                                `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<div data-component="Counter"></div>
<script type="text/babel">
    /** @jsx h */

    function Counter() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            console.log(\`Count is now \${count}\`);
        }, [count]);

        return (
            <div>
                <h1>SynactJS Counter</h1>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
        );
    }

    SynactJS.register(Counter); 
</script>`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'Note: Always include /** @jsx h */ when using JSX with SynactJS.' })
            ];
            break;
        case 'api':
            content = [
                Heading({ text: 'API Reference' }),
                Paragraph({ text: 'Detailed API documentation.' }),

                Heading({ text: 'Component Registration', level: 2 }),
                Paragraph({ text: 'Register components using SynactJS.register(ComponentName) to make them available for mounting.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// Registering a component
function MyComponent() {
    return h('div', null, 'Hello from MyComponent!');
}
SynactJS.register(MyComponent);`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'Components can be functional or class-based, but functional components are preferred for simplicity and performance.' }),

                Heading({ text: 'State Management', level: 2 }),
                Paragraph({ text: 'Use useState to manage local component state. SynactJS will automatically re-render components when state changes.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// Using useState for local state
function Counter() {
    const [count, setCount] = useState(0);
    return h('button', { onClick: () => setCount(count + 1) }, \`Count: \${count}\`);
}
SynactJS.register(Counter);`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'State updates are batched and asynchronous, similar to React.' }),

                Heading({ text: 'Effects', level: 2 }),
                Paragraph({ text: 'Use useEffect to run side effects in your components. SynactJS will handle cleanup automatically.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// Using useEffect for side effects
function Timer() {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);
    return h('div', null, \`Current time: \${new Date(time).toLocaleTimeString()}\`);
}
SynactJS.register(Timer);`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'Effects can depend on state or props, and will re-run when those change.' }),

                Heading({ text: 'Event Handling', level: 2 }),
                Paragraph({ text: 'Attach event handlers directly to elements using the onClick, onChange, etc. attributes.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' },
                                `// Handling events in SynactJS
function ButtonComponent() {
    return h('button', {
        onClick: () => alert('Button clicked!'),
        class: 'bg-blue-500 text-white p-2 rounded'
    }, 'Click Me');
}
SynactJS.register(ButtonComponent);`.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'Event handlers can be defined inline or as separate functions.' }),

                Heading({ text: 'Props', level: 2 }),
                Paragraph({ text: 'Pass props to components using the data-prop attribute in your HTML.' }),
                Box({
                    style: 'background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; font-family: monospace;',
                    children: [
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-html' },
                                `<!-- index.html -->
<div data-component="MyComponent" data-prop='{"title": "Hello World"}'></div>
<script>
function MyComponent({ title }) {
    return h('h1', null, title);
}
SynactJS.register(MyComponent); `.trim())
                        )
                    ]
                }),
                Paragraph({ text: 'Props can be any JSON-serializable value, including objects and arrays.' }),
            ];
            break;
        case 'examples':
            content = [
                Heading({ text: 'Examples' }),
                Paragraph({ text: 'Explore practical examples.' })
            ];
            break;
        default:
            content = [Paragraph({ text: 'Select a section.' })];
    }

    return Container({
        style: 'display: flex; align-items: flex-start; min-height: 100vh;',
        children: [
            Menu(),
            Box({ style: 'padding: 2rem; flex: 1; min-width: 0;', className: 'hidden sm:block', children: content }),
            Box({ style: 'padding: 2rem; flex: 1; min-width: 0;', className: 'sm:hidden', children: allContent })
        ]
    });
}

export function DocsView() {
    return h(Content)
}