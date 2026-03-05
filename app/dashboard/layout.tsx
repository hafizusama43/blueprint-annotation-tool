import { Navbar } from '@/components/layout/navbar'

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <Navbar />
            <div className="flex flex-1 flex-col">{children}</div>
        </main>
    )
}
