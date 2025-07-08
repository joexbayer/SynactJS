import { Navbar as StyledNavbar } from './ui.js';

const NAV_LINKS = [
    { href: "/home", label: "Home", icon: "house" },
    { href: "/docs", label: "Documentation", icon: "info" },
    { href: "/about", label: "About", icon: "lightbulb" },
    { href: "/examples", label: "examples", icon: "flask" },
    { href: "https://github.com/joexbayer/SynactJS/tree/main", label: "", icon: "github-logo" }
];

export function Navbar(props) {
    return StyledNavbar({
        ...props,
        links: NAV_LINKS,
        title: "SynactJS",
        icon: "brain",
    });
}
