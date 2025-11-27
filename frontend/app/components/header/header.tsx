

export function Header() {
    return (
        <header className="w-full bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Comics Engineering</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="/" className="hover:underline">Home</a></li>
                        <li><a href="/books" className="hover:underline">Books</a></li>
                        <li><a href="/collection" className="hover:underline">My collection</a></li>
                        <li><a href="/profile" className="hover:underline">My profile</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}