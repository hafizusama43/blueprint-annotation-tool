import { Navbar } from '@/components/layout/navbar'

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <Navbar />
            <div className="w-full h-full p-5">{children}</div>
        </main>
    )
}
