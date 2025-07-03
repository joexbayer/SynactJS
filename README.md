# mini-react
Mini React implementation
## Overview

This project is a minimal React-like library for building user interfaces with a virtual DOM, hooks, and functional components.

## Features

- Virtual DOM diffing and patching
- `useState` and `useEffect` hooks
- JSX-like element creation with `h()` or tag shorthands
- Simple component model

## Usage

1. **Install**  
    Clone or copy the repository files into your project.

2. **Project Structure**
    Example project structure:
    app/ as the root folder with a app/components/ folder for individual components.
    core/ folder contains the main engine code.

3. **Example: index.html**
    ```html
    <div id="app"></div>
    <script type="module" src="./main.js"></script>
    ```

4. **Main App Entry (`main.js`)**
    ```js
    // CoreJS needs to be included once, then all its exports will be global
    import { renderApp } from '../core/core.js';
    import { App } from './app.js';

    renderApp(App, document.getElementById("app"));
    ```

5. **Defining Components**
    ```js
    export function Counter({ label }) {
      const [count, setCount] = useState(0);
      return div({},
         h1({}, `Counter ${label}: ${count}`),
         button({ onClick: () => setCount(count + 1) }, "Increment")
      );
    }
    ```

    ```js
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
    ```

6. **Using Hooks**
    - `useState(initialValue)` for state
    - `useEffect(effectFn, deps)` for side effects

7. **Shorthand Tags**
    Use `div`, `h1`, `button`, etc., as functions to create elements.

8. **Bundle (Optional)** 
    Use `bundle.sh` to bundle all .js files into a single bundle.js file.

## Example App.js

```js
export function App() {
    const [count, setCount] = useState(0);
    return div({},
        h1({}, 'Mini React Example'),
        button({ onClick: () => setCount(count + 1) }, `Clicked ${count} times`)
    );
}
```

## Host
```bash
python3 -m http.server
```

In the root folder

## License

MIT