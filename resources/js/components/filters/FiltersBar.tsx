import { Button } from "@/components/ui/button"
import { FilterIcon, RotateCcwIcon } from "lucide-react"

interface Props {
    children?: React.ReactNode
    actions?: React.ReactNode
}

export default function FiltersBar({
    children,
    actions
}: Props) {
    return (
        <div className="bg-secondary border rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <FilterIcon className="w-4 h-4"/>
                Filtros
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {children}
                </div>
                <div className="flex items-center gap-2">
                    {actions}                    
                </div>
            </div>
        </div>
    )
}