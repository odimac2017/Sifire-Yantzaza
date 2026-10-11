import { Link } from "@inertiajs/react";

interface LinkProps {
    active: boolean,
    label: string,
    url: string | null
}

export default function Pagination({ links }: { links: LinkProps[] }) {
    return (
        <div className="flex flex-wrap justify-center items-center gap-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url ?? ''}
                    preserveState
                    preserveScroll
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 text-sm rounded border transition
                        ${link.active
                            ? 'bg-accent-foreground text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'}
                        ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                />
            ))}
        </div>
    );
}