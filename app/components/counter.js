import { ThemeContext } from "../app.js";

export function Counter({ label }) {
    const [count, setCount] = useState(0);

    const theme = useContext(ThemeContext);

    useEffect(() => {
        console.log(`[${label}] count is now ${count}`);
    }, [count]);

    return div({ class: 'card p-6 bg-white rounded shadow flex flex-col items-center gap-4' },
        h3({ class: 'text-xl font-bold' }, label),
        p({ class: 'text-gray-700' }, `Count: ${count}`),
        button({
            class: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition',
            onClick: () => setCount(count + 1)
        }, `Click ${theme}`)
    );
}