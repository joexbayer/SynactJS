import { Card, Heading, Paragraph } from './ui.js';

export function ComboBox({ label = 'Choose an option', options = [], fetchUrl = null, placeholder = 'Select or search...', onSelect = () => { }, mapResult = () => { }, className = '', name = '', }) {
    const [inputValue, setInputValue] = useState('');
    const [list, setList] = useState(options);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlight, setHighlight] = useState(-1);

    useEffect(() => {
        if (!fetchUrl) {
            setList(
                options.filter(opt =>
                    opt.label.toLowerCase().includes(inputValue.toLowerCase())
                )
            );
        }
    }, [inputValue, options, fetchUrl]);

    useEffect(() => {
        function handleClick(e) {
            if (!e.target.closest('.combobox-root')) setShow(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function handleInput(e) {
        const val = e.target.value;
        setInputValue(val);
        setShow(true);
        setHighlight(-1);

        if (fetchUrl) {
            if (window._comboboxFetchTimeout) clearTimeout(window._comboboxFetchTimeout);
            window._comboboxFetchTimeout = setTimeout(async () => {
                setLoading(true);
                try {
                    const res = await fetch(`${fetchUrl}${encodeURIComponent(val)}`);
                    const data = await res.json();
                    const items = (data.items || []).map(mapResult);
                    setList(items);
                } catch {
                    setList([]);
                }
                setLoading(false);
            }, 300);
        }
    }

    function handleSelect(opt) {
        setShow(false);
        onSelect(opt);
        setInputValue(opt.label);
    }

    function handleKeyDown(e) {
        if (!show) return;
        if (e.key === 'ArrowDown') {
            setHighlight(highlight < list.length - 1 ? highlight + 1 : highlight);
        } else if (e.key === 'ArrowUp') {
            setHighlight(highlight > 0 ? highlight - 1 : highlight);
        } else if (e.key === 'Enter' && highlight >= 0) {
            handleSelect(list[highlight]);
        }
    }

    return Card({
        className: `max-w-md mx-auto ${className}`,
        content: [
            Heading({ text: label, className: 'mb-2 text-left' }),
            div({ class: 'relative combobox-root' },
                input({
                    type: 'text',
                    value: inputValue,
                    placeholder,
                    class: 'w-full border px-3 py-2 rounded focus:outline-none',
                    onInput: handleInput,
                    onFocus: () => setShow(true),
                    onKeyDown: handleKeyDown,
                    autoComplete: 'off',
                    name,
                }),
                show && (
                    div({ class: 'absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-auto' },
                        loading ? Paragraph({ text: 'Loading...' })
                            : list.length === 0
                                ? Paragraph({ text: 'No results found.', className: 'text-gray-500 text-sm p-2' })
                                : list.map((opt, i) =>
                                    div({
                                        key: opt.value || opt.name || i,
                                        class: `px-3 py-2 cursor-pointer hover:bg-slate-100`,
                                        onMouseDown: () => handleSelect(opt)
                                    }, opt.label || opt.name)
                                )
                    )
                )
            )
        ]
    });
}
