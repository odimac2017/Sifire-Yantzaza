type TableSkeletonProps = {
    rows?: number;
    columns: number;
    widths?: string[];
};

export default function TableSkeleton({
    rows = 6,
    columns,
    widths = [],
}: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="p-3">
                            <div
                                className={`h-4 bg-gray-200 rounded ${
                                    widths[colIndex] ?? "w-full"
                                }`}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}