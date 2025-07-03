export function Counter({ label }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(`[${label}] count is now ${count}`);
    }, [count]);

    return div({ class: 'card' },
        h3({}, label),
        p({}, `Count: ${count}`),
        button({ onClick: () => setCount(count + 1) }, 'Click')
    );
}