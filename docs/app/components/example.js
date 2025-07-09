import { Section, Card, Subheading, Paragraph, Button, Heading } from './ui.js';
import { LiveCounterDemo } from './counter.js';

const codeString = `
import { Card, Subheading, Paragraph, Button } from './ui.js';

export function LiveCounterDemo() {
    const [count, setCount] = useState(0);

    return Card({
        content: [
            Subheading({ text: '⚡ Live Counter Demo' }),
            Paragraph({ text: \`Count is: \${count}\` }),
            Button({ text: 'Increment',
                onClick: () => setCount(count + 1),
                className: 'mr-2'
            }),
            Button({
                text: 'Reset', onClick: () => setCount(0),
                className: 'bg-slate-300 text-slate-800'
            })
        ]
    });
}
`;

export function CodeExample() {

    useEffect(() => {
        requestAnimationFrame(() => {
            if (window.Prism?.highlightAll) {
                window.Prism.highlightAll();
            }
        });
    }, []);

    return Section({
        children: Card({
            className: 'text-4xl',
            content: [
                Heading({ text: 'How SynactJS handles reactivity and UI composition.', className: 'text-center text-4xl' }),

                Paragraph({
                    text: 'The example below is a simple live counter. It uses the useState hook to manage state and responds to button clicks to increment or reset the count.',
                    className: 'text-slate-600 space-y-3 text-sm leading-relaxed mb-6'
                }),

                div({ class: 'flex flex-col-reverse lg:flex-row gap-6 mt-6 items-start lg:items-stretch' },
                    div({ class: 'bg-slate-50 rounded border border-slate-200 p-4 w-full lg:w-2/3 overflow-auto text-sm' },
                        pre({ class: 'text-sm leading-relaxed' },
                            code({ class: 'language-js' }, codeString.trim())
                        )
                    ),
                    div({ class: 'bg-slate-100 rounded border border-slate-200 p-6 w-full lg:w-1/3 flex items-center justify-center text-sm' },
                        h(LiveCounterDemo)
                    )
                ),
                Paragraph({
                    text: 'The UI is composed using reusable components like Card, Subheading, Paragraph, and Button. Event handling is declarative and state-driven, using functional patterns similar to React.',
                    className: 'text-slate-600 space-y-3 text-sm leading-relaxed mb-6'
                }),
            ]
        })
    });
}