import { Counter } from './components/counter.js';
import { Posts } from './components/posts.js';

export function App() {
    return div({},
        h1({}, 'Mini React'),
        Counter({ label: 'A' }),
        Counter({ label: 'B' }),
        Posts()
    );
}