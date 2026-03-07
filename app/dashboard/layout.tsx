import { Navbar } from '@/components/layout/navbar'

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="w-full h-full">{children}</div>
        </main>
    )
}
