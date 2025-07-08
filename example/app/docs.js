import { Container, Section, Card, Heading, Paragraph, Divider, Box, Link } from './components/ui.js';

const docsSections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'install', title: 'Installation' },
    { id: 'usage', title: 'Usage' },
    { id: 'api', title: 'API Reference' },
    { id: 'examples', title: 'Examples' }
];


function Content() {

    const [selectedSection, setSelectedSection] = useState(docsSections[0].id);

    function Menu() {
        const menuItems = docsSections.map(section =>
            
            Link({ href: `#${section.id}`, text: section.title,
                className: `block py-2 px-4 rounded ${selectedSection == section.id ? 'bg-gray-200 font-semibold' : ''}`,
                onClick: (e) => {
                    e.preventDefault();
                    setSelectedSection(section.id);
                }
            })
        );

        return Box({
            className: 'menu',
            style: 'min-width: 220px; border-right: 1px solid #eee; padding: 2rem 1rem; height: 100vh; position: sticky; top: 0;',
            children: menuItems
        });
    }
    
    let content;
    switch (selectedSection) {
        case 'intro':
            content = [
                Heading({ text: 'Introduction' }),
                Paragraph({ text: 'Welcome to the SynactJS documentation. Here you will find everything you need to get started.' })
            ];
            break;
        case 'install':
            content = [
                Heading({ text: 'Installation' }),
                Paragraph({ text: 'Install SynactJS with a simple script tag or npm package.' })
            ];
            break;
        case 'usage':
            content = [
                Heading({ text: 'Usage' }),
                Paragraph({ text: 'Learn how to use SynactJS in your project.' })
            ];
            break;
        case 'api':
            content = [
                Heading({ text: 'API Reference' }),
                Paragraph({ text: 'Detailed API documentation.' })
            ];
            break;
        case 'examples':
            content = [
                Heading({ text: 'Examples' }),
                Paragraph({ text: 'Explore practical examples.' })
            ];
            break;
        default:
            content = [Paragraph({ text: 'Select a section.' })];
    }
 
    return Container({
        style: 'display: flex; align-items: flex-start; min-height: 100vh;',
        children: [
            Menu(),
            Box({ style: 'padding: 2rem; flex: 1; min-width: 0;', children: content })
        ]
    });
}

export function DocsView() {
    return h(Content)
}