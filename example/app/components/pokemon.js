import { Card, Heading, Paragraph, Button, Image } from './ui.js';

export function RandomPokemon() {
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRandomPokemon = async () => {
        setLoading(true);
        const id = Math.floor(Math.random() * 151) + 1;
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await res.json();
            setPokemon({
                name: data.name,
                sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites.front_default,
                id: data.id,
                types: data.types.map(t => t.type.name).join(', ')
            });
        } catch (err) {
            console.error('Failed to fetch Pokémon:', err);
            setPokemon(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRandomPokemon();
    }, []);

    return Card({
        className: 'text-center max-w-md mx-auto',
        content: [
            Heading({ text: '🎲 Random Pokémon' }),

            (() => {
                if (loading) {
                    return Paragraph({ text: 'Loading a wild Pokémon...' });
                }
                if (pokemon) {
                    return div({ class: 'space-y-3' },
                        Image({ src: pokemon.sprite, alt: pokemon.name, className: 'mx-auto w-48 h-48 object-contain' }),
                        p({ class: 'capitalize font-semibold text-lg text-slate-800' }, `#${pokemon.id} ${pokemon.name}`),
                        p({ class: 'text-slate-500 text-sm' }, `Type: ${pokemon.types}`)
                    );
                }
                return div({}, '');
            })(),

            Button({
                text: 'Get Another',
                onClick: fetchRandomPokemon,
                className: 'mt-4'
            })
        ]
    });
}