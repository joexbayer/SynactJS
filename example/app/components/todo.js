import { Card, Heading, Input, Button, List, ListItem, Box } from './ui.js';

export function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');

    function addTask() {
        console.log('Adding task:', text);
        if (text.trim() === '') return;
        setTasks([...tasks, text.trim()]);
        setText('');
    }

    return Card({
        className: 'p-6 bg-white rounded shadow flex flex-col gap-4 w-full max-w-md mx-auto',
        content: [
            Heading({ text: 'Todo List', className: 'mb-2' }),
            Box({
                className: 'flex gap-2',
                children: [
                    Input({
                        value: text,
                        onInput: e => setText(e.target.value),
                        placeholder: 'New task...',
                        className: 'flex-grow'
                    }),
                    Button({
                        text: 'Add',
                        onClick: addTask,
                        className: 'bg-green-600 hover:bg-green-700'
                    })
                ]
            }),
            List({
                items: tasks.map(task => ListItem({ children: task })),
                className: 'text-gray-800'
            })
        ]
    });
}