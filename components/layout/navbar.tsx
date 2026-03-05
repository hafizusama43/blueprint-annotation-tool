import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export function Navbar() {
    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b border-white/10 bg-slate-950/70',
                'backdrop-blur-sm',
            )}
        >
            <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3">
                <Link href="/" className="flex items-center gap-3 text-white">
                    <div className="rounded-full bg-white/10 p-2 text-white shadow-lg shadow-black/50 transition hover:bg-white/20">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-semibold tracking-wide">
                        Blueprint Annotation Tool
                    </span>
                </Link>
                <div>
                    <Button variant="secondary">Reset</Button>
                </div>
            </div>
        </header>
    )
}
