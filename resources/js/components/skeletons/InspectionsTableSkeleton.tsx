export default function InspectionsTableSkeleton() {
    return (
        <div className="border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                <div className="h-3 w-64 bg-gray-100 rounded mt-2"></div>
            </div>

            {/* Table */}
            <div className="p-4 space-y-3">

                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            {/* avatar */}
                            <div className="w-9 h-9 bg-gray-200 rounded-full" />

                            <div className="space-y-2">
                                <div className="h-3 w-32 bg-gray-200 rounded" />
                                <div className="h-2 w-24 bg-gray-100 rounded" />
                            </div>

                        </div>

                        {/* columnas */}
                        <div className="flex gap-6 items-center">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="h-6 w-20 bg-gray-100 rounded-full" />
                            <div className="h-8 w-8 bg-gray-200 rounded" />
                        </div>

                    </div>
                ))}

            </div>
        </div>
    );
}