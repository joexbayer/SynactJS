import { Container, Section, Card, Heading, Paragraph, Button, Divider, Icon } from './components/ui.js';
import { FeaturesSection } from './components/features.js';
import { RandomPokemon } from './components/pokemon.js';
import { CodeExample } from './components/example.js';
import { Todo } from './components/todo.js';

export function HomeView() {
    return Container({
        children: [
            // Hero
            Section({
                className: 'text-center',
                children: Card({
                    content: [
                        Icon({ name: 'sparkle', size: 40, className: 'mb-2 text-indigo-500' }),
                        Heading({ text: 'Welcome to SynactJS!' }),
                        Paragraph({ text: 'A modern, browser-native UI framework with no build tools and full runtime reactivity.' }),
                        Button({ text: 'Get Started', onClick: () => alert('Getting started soon!') })
                    ]
                })
            }),

            h(CodeExample),
            Divider(),

            h(FeaturesSection),

            // Pokemon and Todo apps side by side
            div({ style: "display: flex; gap: 2rem; justifyContent: center" },
                h(RandomPokemon),
                h(Todo)
            ),

            Divider(),

            Section({
                className: 'text-center',
                children: Card({
                    content: [
                        Icon({ name: 'rocket', size: 32, className: 'mb-2 text-indigo-500' }),
                        Heading({ text: 'Ready to Dive In?' }),
                        Paragraph({ text: 'Explore examples, dive into the docs, or embed SynactJS into your next project.' }),
                        Button({ text: 'View Examples', onClick: () => window.location.href = '/examples' })
                    ]
                })
            })
        ]
    });
}