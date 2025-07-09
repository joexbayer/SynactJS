# SynactJS

A lightweight, browser-only UI framework built as a hobby project to learn about how React works. With a focus on no classes, no build tools, no servers required. It runs directly in the browser and is perfect for small projects, quick experiments, or progressively enhancing static and server-rendered pages.

In it's current state, very similar to Preact. This framework is entirely built around functions, hooks, and a virtual DOM. Its long-term goal is to evolve with unique features specifically for the web platform, allowing use alongside serverside rendered apps such as Rails or Django.

> **Warning:** SynactJS is an educational project to help understand how React-like libraries work internally. It is not intended for production use.

## Documentation

You can find the latest documentation and live demos on the [SynactJS Docs (GitHub Pages)](https://joexbayer.github.io/SynactJS/), which is built with SynactJS.

## CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
```

## Features

- Virtual DOM diffing and patching
- `useState` and `useEffect`, `useMemo` hooks
- JSX-like element creation with `h()` or tag shorthands
- Simple component model

## Usage

1. **Use**  
    To quickly try SynactJS, you can load it directly from a CDN in your HTML:

    ```html
    <script type="module" src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
    ```

2. **Project Structure**  
    Example project structure in `/docs`:
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
     <script type="module" src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
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
     <script type="module" src="https://cdn.jsdelivr.net/gh/joexbayer/SynactJS@refs/heads/main/synact.min.js"></script>
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