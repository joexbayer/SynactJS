import { Card, Heading, Paragraph } from './ui.js';

export function DateTimePicker({ label = 'Pick a date and time', value = '', onChange = () => { }, className = '', name = '', placeholder = 'YYYY-MM-DD HH:mm', min = '', max = '' }) {
    const [inputValue, setInputValue] = useState(value);
    const [show, setShow] = useState(false);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        function handleClick(e) {
            if (!e.target.closest('.datetimepicker-root')) setShow(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleInput(e) {
        setInputValue(e.target.value);
        onChange(e.target.value);
    }

    function handleFocus() {
        setShow(true);
    }

    function handleSelect(e) {
        setInputValue(e.target.value);
        setShow(false);
        onChange(e.target.value);
    }

    return Card({
        className: `max-w-md mx-auto ${className}`,
        content: [
            Heading({ text: label, className: 'mb-2 text-left' }),
            div({ class: 'relative datetimepicker-root' },
                input({
                    type: 'text', value: inputValue,
                    placeholder,
                    class: 'w-full border px-3 py-2 rounded focus:outline-none',
                    onInput: handleInput,
                    onFocus: handleFocus,
                    autoComplete: 'off',
                    name,
                }),
                show && (
                    div({ class: 'absolute z-10 bg-white border w-full mt-1 rounded shadow p-2' },
                        input({
                            type: 'datetime-local',
                            value: inputValue,
                            min,
                            max,
                            class: 'w-full border px-2 py-1 rounded',
                            onInput: handleSelect,
                            autoFocus: true
                        })
                    )
                )
            )
        ]
    });
}