import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRef } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (value: string) => {

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onChange(value);
        }, 400);
    };

    return (
        <div className="relative w-full md:w-[320px]">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input
                type="text"
                defaultValue={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder || "Buscar"}
                className="pl-9 bg-white dark:bg-background"
            />
        </div>
    );
}