import { Card, Heading, Paragraph, PostTitle } from './ui.js';

export function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Fetching posts...');
        fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            });
    }, []);

    console.log(posts, setPosts, loading, setLoading);

    return Card({
        content: [
            Heading({ text: 'Latest Posts' }),
            loading ? [Paragraph({ text: 'Loading...' })]
            : posts.map(post =>
                div({ key: post.id },
                    PostTitle({ text: post.title }),
                    Paragraph({ text: post.body })
                )
            )
        ]
    });
}