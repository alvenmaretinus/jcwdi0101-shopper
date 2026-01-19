import Link from "next/link";

type Props = {
    links: { path: string, label: string }[]
}

export const LinksFooter = ({ links }: Props) => {
    return <div >
        <h4 className="font-semibold mb-4">Shop</h4>
        <ul className="space-y-3">
            {links.map((link) => (
                <li key={link.path}>
                    <Link
                        href={link.path}
                        className="text-background/70 hover:text-primary transition-colors"
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
};

