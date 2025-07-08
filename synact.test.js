const {
    h,
    createElement,
    setProps,
    updateProps,
    patch,
    useState,
    useEffect,
    useContext,
    createContext,
    renderApp,
    div,
    button,
    Fragment,
    useRouter,
    RouteView,
    useMemo,
    useCallback
} = require('./synact.js');

describe('Virtual DOM & h()', () => {
    it('creates a vnode for a tag', () => {
        const vnode = h('div', { id: 'foo' }, 'bar');
        expect(vnode).toEqual({
            __type: 'div',
            props: { id: 'foo' },
            children: ['bar'],
            key: null
        });
    });

    it('creates a vnode for a tag with key', () => {
        const vnode = h('li', { key: 1 }, 'item');
        expect(vnode.key).toBe(1);
    });
});

describe('createElement', () => {
    it('creates a DOM element from vnode', () => {
        const vnode = h('div', { id: 'test' }, 'hello');
        const el = createElement(vnode);
        expect(el.tagName).toBe('DIV');
        expect(el.id).toBe('test');
        expect(el.textContent).toBe('hello');
    });

    it('creates a text node from string', () => {
        const el = createElement('foo');
        expect(el.nodeType).toBe(Node.TEXT_NODE);
        expect(el.textContent).toBe('foo');
    });

    it('throws on invalid vnode', () => {
        expect(() => createElement({})).toThrow();
    });

    it('throws on functional component', () => {
        const Comp = () => h('div', {}, 'x');
        expect(() => createElement(h(Comp))).toThrow();
    });
});

describe('setProps and updateProps', () => {
    let el;
    beforeEach(() => {
        el = document.createElement('div');
    });

    it('sets attributes', () => {
        setProps(el, { id: 'foo', title: 'bar' });
        expect(el.id).toBe('foo');
        expect(el.title).toBe('bar');
    });

    it('sets event handlers', () => {
        const fn = jest.fn();
        setProps(el, { onClick: fn });
        el.onclick();
        expect(fn).toHaveBeenCalled();
    });

    it('updates and removes attributes', () => {
        setProps(el, { id: 'foo', title: 'bar' });
        updateProps(el, { id: 'baz' }, { id: 'foo', title: 'bar' });
        expect(el.id).toBe('baz');
        expect(el.hasAttribute('title')).toBe(false);
    });
});

describe('patch', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('appends new vnode', () => {
        patch(container, h('div', {}, 'hi'), null);
        expect(container.innerHTML).toBe('<div>hi</div>');
    });

    it('removes vnode', () => {
        patch(container, h('div', {}, 'hi'), null);
        patch(container, null, h('div', {}, 'hi'));
        expect(container.innerHTML).toBe('');
    });

    it('replaces vnode', () => {
        patch(container, h('div', {}, 'hi'), null);
        patch(container, h('span', {}, 'bye'), h('div', {}, 'hi'));
        expect(container.innerHTML).toBe('<span>bye</span>');
    });

    it('patches children', () => {
        patch(container, h('ul', {}, h('li', {}, 'a')), null);
        patch(
            container,
            h('ul', {}, h('li', {}, 'a'), h('li', {}, 'b')),
            h('ul', {}, h('li', {}, 'a'))
        );
        expect(container.querySelectorAll('li').length).toBe(2);
    });
});

describe('Hooks: useState', () => {
    it('updates state and rerenders', () => {
        function Counter() {
            const [count, setCount] = useState(0);
            return div({}, button({ onClick: () => setCount(count + 1) }, count));
        }
        const container = document.createElement('div');
        renderApp(Counter, container);
        const btn = container.querySelector('button');
        expect(btn.textContent).toBe('0');
        btn.click();
        setTimeout(() => {
            expect(btn.textContent).toBe('1');
        });
    });
});

describe('Hooks: useEffect', () => {
    it('runs effect after render', () => {
        const effect = jest.fn();
        function Comp() {
            useEffect(effect, []);
            return div({}, 'x');
        }
        const container = document.createElement('div');
        renderApp(Comp, container);
        expect(effect).toHaveBeenCalled();
    });
});

describe('Context', () => {
    it('provides and consumes context', () => {
        const MyContext = createContext('default');
        function Child() {
            const value = useContext(MyContext);
            return p({}, value);
        }

        function App() {
            // Use h() to render the Provider as a component, not as a DOM element
            return h(MyContext.Provider, {
                value: "provided",
                children: h(Child)
            });
        }

        const container = document.createElement('div');
        renderApp(App, container);
        expect(container.textContent).toBe('provided');
    });
});

describe('useRouter', () => {
    it('returns current route and push changes it', () => {
        window.history.pushState({}, '', '/foo');
        function App() {
            const [route, push] = useRouter();
            return div({}, route, button({ onClick: () => push('/bar') }, ''));
        }
        const container = document.createElement('div');
        renderApp(App, container);
        expect(container.textContent).toContain('/foo');
        container.querySelector('button').click();

        setTimeout(() => {
            expect(container.textContent).toContain('/bar');
        }, 0);

    });
});

describe('RouteView', () => {
    it('renders matching route', () => {
        window.history.pushState({}, '', '/a');
        const routes = {
            '/a': () => h('div', {}, 'A'),
            '/b': () => h('div', {}, 'B'),
            '*': () => h('div', {}, 'Not found')
        };
        const container = document.createElement('div');
        renderApp(() => h(RouteView, { routes }), container);
        expect(container.textContent).toBe('A');
        window.history.pushState({}, '', '/b');
        window.dispatchEvent(new PopStateEvent('popstate'));

        setTimeout(() => {
            expect(container.textContent).toBe('B');
        }, 0);
    });
});

describe('useMemo and useCallback', () => {
    it('recomputes memoized value when deps change', () => {
        let calls = 0;
        let dep = 1;

        function App() {
            const val = useMemo(() => { calls++; return dep * 2; }, [dep]);
            return div({}, String(val));
        }

        const container = document.createElement('div');
        renderApp(App, container);
        expect(container.textContent).toBe('2');
        expect(calls).toBe(1);

        // Change dependency and rerender
        dep = 5;
        renderApp(App, container);
        expect(container.textContent).toBe('10');
        expect(calls).toBe(2);
    });

    it('memoizes callback', () => {
        let calls = 0;
        function App() {
            const cb = useCallback(() => { calls++; }, []);
            cb();
            return div({}, 'x');
        }
        const container = document.createElement('div');
        renderApp(App, container);
        renderApp(App, container);
        expect(calls).toBe(2);
    });
});