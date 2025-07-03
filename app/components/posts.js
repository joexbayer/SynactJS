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

    return div({ class: 'card' },
        h3({}, 'Latest Posts'),
        loading
            ? p({}, 'Loading...')
            : posts.map(post =>
                div({ key: post.id },
                    strong({}, post.title),
                    p({}, post.body)
                )
            )
    );
}