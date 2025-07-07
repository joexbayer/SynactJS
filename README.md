# SynactJS

A minimal React/Preact-inspired UI library with hooks and a virtual DOM, no build tools, runs directly in the browser. Great for small projects, experiments, and progressive enhancement.

> **Warning:** SynactJS is an educational project to help understand how React-like libraries work internally. It is not intended for production use.

## Overview

This is a lightweight, hobby project inspired by React and heavily influenced by Preact. It offers a minimal framework for building user interfaces using a virtual DOM, functional components, and simple hooks like useState and useEffect.

You can run it directly in the browser, without needing a server, bundler, or Babel. It’s ideal for small projects, experiments, or embedding interactive components into static or server-rendered pages. It also plays well with server-side rendering setups if needed.

While it’s not intended for large-scale production apps, the focus is on keeping it easy to use, flexible, and open to extension. The goal is to explore modern UI features in a minimal environment — and to evolve it over time with things like custom hooks, context, routing, and more.

## Features

- Virtual DOM diffing and patching
- `useState` and `useEffect`, `useMemo` hooks
- JSX-like element creation with `h()` or tag shorthands
- Simple component model

## Usage

1. **Use**  
    To quickly try SynactJS, you can load it directly from a CDN in your HTML:

    ```html
    <script src="TODO()"></script>
    ```

2. **Project Structure**  
    Example project structure:
    - `app/` as the root folder, with an `app/components/` folder for individual components.

---

### Example 1: Full App Usage

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8" />
     <title>SynactJS</title>
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
     <script src="TODO()"></script>
</head>
<body>
     <!-- Mount the main App component -->
     <div data-component="App"></div>
     <script type="module" src="./main.js"></script>
</body>
</html>
```

**main.js**
```js
import { App } from './app.js';

// Register your main App component (See example files in the app/ folder)
SynactJS.register(App);
```

---

### Example 2: Direct Use of Counter Component

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8" />
     <title>SynactJS</title>
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
     <script src="TODO()"></script>
</head>
<body>
     <div data-component="Counter" data-prop='{"label":"Counter A"}'></div>
     <script>
        function Counter({ label = 'Counter' }) {
            const [count, setCount] = useState(0);

            useEffect(() => {
                console.log(`[${label}] count is now ${count}`);
            }, [count]);

            return button({
                class: 'bg-blue-600 text-white p-2',
                onClick: () => setCount(count + 1)
            }, `Click Me ${count} (${label})`);
        }

        SynactJS.register(Counter);
    </script>
</body>
</html>
```

---

## Babel compatible

Although not how its "meant" to be used, you can also use SynactJS with Babel and JSX for a more React-like developer experience. See the example below:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<div data-component="Counter"></div>
<script type="text/babel">
    /** @jsx h */

    function Counter() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            console.log(`Count is now ${count}`);
        }, [count]);

        return (
            <div>
                <h1>SynactJS Counter</h1>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
        );
    }

    SynactJS.register(Counter); 
</script>
```

### Note on JSX Usage

When using SynactJS (or similar libraries like Preact) with Babel or TypeScript, you must specify the JSX factory function at the top of your file using the `/** @jsx h */` pragma. This tells the transpiler to convert JSX syntax into calls to the `h` function instead of the default `React.createElement`. Omitting this directive can lead to runtime errors if React is not present or if you intend to use a different JSX runtime. Always include `/** @jsx h */` at the top of your file when working with alternative JSX runtimes to ensure correct compilation.

## License

MIT