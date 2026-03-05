import { Folder } from 'lucide-react'
import Link from 'next/link'

const folders = [
    {
        id: 1,
        name: 'Blueprints',
        path: 'blueprints',
    },
]
export default function Page() {
    return (
        <div className="flex flex-col items-start gap-4">
            {' '}
            {folders.map((folder) => (
                <div
                    key={folder.id}
                    className="flex flex-col items-start gap-2 hover:bg-gray-100 rounded-md p-2"
                >
                    <Link
                        href={`/dashboard/${folder.path}`}
                        className="flex flex-col items-center gap-2"
                    >
                        <Folder className="h-10 w-10" />
                        <span className="text-sm">{folder.name}</span>
                    </Link>
                </div>
            ))}{' '}
        </div>
    )
}
