import { Card, Heading, Paragraph } from './ui.js';

export function Clock({ className = '' }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return Card({
        className: `max-w-xs mx-auto text-center ${className}`,
        content: [
            Heading({ text: 'Current Time', className: 'mb-2' }),
            Paragraph({ text: time.toLocaleTimeString(), className: 'text-2xl font-mono' })
        ]
    });
}