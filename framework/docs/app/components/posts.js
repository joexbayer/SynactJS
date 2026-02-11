import { Card, Heading, Paragraph } from './ui.js';

export function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            });
    }, []);

    return Card({
        content: [
            Heading({ text: 'Latest Posts' }),
            loading
                ? Paragraph({ text: 'Loading...' })
                : posts.map(post =>
                    div({ key: post.id, class: 'mb-6' },
                        Heading({ text: post.title, className: 'text-xl mb-1' }),
                        Paragraph({ text: post.body })
                    )
                )
        ]
    });
}