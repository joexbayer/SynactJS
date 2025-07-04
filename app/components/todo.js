export function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');

    function addTask() {
        if (text.trim() === '') return;
        setTasks([...tasks, text.trim()]);
        setText('');
    }

    return div({ class: 'card p-6 bg-white rounded shadow flex flex-col gap-4 w-full max-w-md mx-auto' },
        h3({ class: 'text-xl font-bold' }, 'Todo List'),
        div({ class: 'flex gap-2' },
            input({
                class: 'flex-grow px-3 py-2 border rounded',
                value: text,
                onInput: e => setText(e.target.value),
                placeholder: 'New task...'
            }),
            button({
                class: 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition',
                onClick: addTask
            }, 'Add')
        ),
        ul({ class: 'list-disc list-inside text-gray-800' },
            ...tasks.map(task => li({}, task))
        )
    );
}