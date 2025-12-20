export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                {children}
            </div>
        </div>
    )
}
