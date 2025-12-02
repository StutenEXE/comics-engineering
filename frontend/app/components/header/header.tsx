

import { useSelector } from 'react-redux';
import type { RootState } from '~/store/store';
import { LoginForm } from '../forms/loginForm';
import { useState } from 'react';
import { SignupForm } from '../forms/signupForm';

export function Header() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
    // Handles login modal state
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    // Handles signup modal state
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    const openLoginModal = () => {
        setIsSignupOpen(false);
        setIsLoginOpen(true);
    }

    const openSignupModal = () => {
        setIsLoginOpen(false);
        setIsSignupOpen(true);
    }

    return (
        <header className="w-full bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="/kystash-logo.png" alt="logo" className="w-20"/>
                    <h1 className="text-2xl font-bold">
                        <span className="text-yellow-300">K</span>now&nbsp; 
                        <span className="text-yellow-300">Y</span>our&nbsp;
                        <span className="text-yellow-300">S</span>tash
                    </h1>
                    {isAuthenticated && (
                        <p>Welcome, {user?.username}!</p>
                    )}
                </div>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="/" className="hover:underline">Home</a></li>
                        <li><a href="/books" className="hover:underline">Books</a></li>
                        {isAuthenticated ? (
                            <>
                                <li><a href="/collection" className="hover:underline">My collection</a></li>
                                <li><a href="/profile" className="hover:underline">My profile</a></li>
                            </>
                        ) : (
                            <>
                                <li><p className="hover:underline cursor-pointer" onClick={openLoginModal}>Login</p></li>
                                <li><p className="hover:underline cursor-pointer" onClick={openSignupModal}>Sign up</p></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
            {/* Modals */}
            <section className="w-full max-w-lg mx-auto absolute top-20 left-0 right-0">
                { isLoginOpen && (
                    <LoginForm
                        onDone={() => setIsLoginOpen(false)}
                        onCancel={() => setIsLoginOpen(false)}
                    />
                )}
                { isSignupOpen && (
                    <SignupForm
                        onDone={() => setIsSignupOpen(false)}
                        onCancel={() => setIsSignupOpen(false)}
                    />
                )}
            </section>
        </header>
    );
}