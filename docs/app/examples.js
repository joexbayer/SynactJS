import { ComboBox } from './components/combobox.js';
import { DateTimePicker } from './components/datetimepicker.js';
import { Clock } from './components/clock.js';

import { Heading, Paragraph, Box, Container, Subheading } from './components/ui.js';

export function ExamplesView() {
    return (
        Container({
            style: 'min-height: 100vh;',
            children: [
                Heading({ text: 'Examples' }),
                Paragraph({ text: 'Here are some examples of SynactJS components in action.' }),
                Subheading({ text: 'Counter Example' }),
                Paragraph({ text: 'A simple counter component that updates in real-time.' }),
                h(Clock, { className: "mt-4" }),
                Subheading({ text: 'Combobox Example' }),
                Paragraph({ text: 'A combobox component that fetches GitHub users.' }),

                h(ComboBox, {
                    label: "Combobox Search",
                    placeholder: "Search for components...",
                    options: [
                        { label: "Counter", value: "Counter" },
                        { label: "Combobox", value: "Combobox" },
                        { label: "Navbar", value: "Navbar" },
                        { label: "LiveCounterDemo", value: "LiveCounterDemo" },
                        { label: "CodeExample", value: "CodeExample" }
                    ],
                    name: "component-search",
                    onSelect: (opt) => {
                        //window.location.href = `/SynactJS/${opt.value.toLowerCase()}`;
                    }
                }),

                Subheading({ text: 'GitHub User Search', className: 'mt-6' }),
                Paragraph({
                    text: 'A combobox that fetches GitHub users as you type.'
                }),

                h(ComboBox, {
                    label: 'GitHub user',
                    fetchUrl: 'https://api.github.com/search/users?q=',
                    placeholder: 'Type a GitHub username…',
                    mapResult: user => ({
                        label: user.login,
                        value: user.id
                    }),
                    onSelect: u => console.log('You chose', u),
                }),

                Subheading({ text: 'DateTimePicker Example' }),
                Paragraph({ text: 'A date and time picker component.' }),

                h(DateTimePicker, {
                    label: "Pick a date and time",
                    value: "2023-10-01 12:00",
                    onChange: (val) => console.log("Selected date:", val),
                    className: "mt-4",
                    placeholder: "YYYY-MM-DD HH:mm",
                    min: "2023-01-01 00:00",
                    max: "2024-12-31 23:59"
                }),
                div({ class: "text-lg font-semibold mb-2 mt-6" }, "More Info & Examples"),
                div({ class: "mb-2" },
                    "Explore the source code and examples for this website on ",
                    a({ href: "https://github.com/joexbayer/SynactJS/tree/main", target: "_blank", class: "text-blue-600 underline" }, "GitHub"),
                    "."
                ),

            ]
        })
    );
}