import { Card, Subheading, Paragraph, Button } from './ui.js';

export function LiveCounterDemo() {
    const [count, setCount] = useState(0);

    return Card({
        content: [
            Subheading({ text: '⚡ Live Counter Demo' }),
            Paragraph({ text: `Count is currently: ${count}` }),
            Button({
                text: 'Increment',
                onClick: () => setCount(count + 1),
                className: 'mr-2'
            }),
            Button({
                text: 'Reset',
                onClick: () => setCount(0),
                className: 'bg-slate-300 text-slate-800 hover:bg-slate-400'
            })
        ]
    });
}