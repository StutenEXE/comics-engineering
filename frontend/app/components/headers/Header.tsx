import { Link } from 'react-router'
import { useSelector } from 'react-redux';
import type { RootState } from '~/store/store';
import { LoginForm } from '../forms/LoginForm';
import { useState } from 'react';
import { SignupForm } from '../forms/SignupForm';
import { useTranslation } from '~/i18n/i18n';
import { LoginModal } from '../modals/LoginModal';
import { SignupModal } from '../modals/SignupModal';

export function Header() {
    const { t } = useTranslation();

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
                        <p>{t("header.welcome")}, {user?.username}!</p>
                    )}
                </div>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link to="/" className="hover:underline cursor-pointer">{t("header.home")}</Link></li>
                        <li><Link to="search" className="hover:underline cursor-pointer">{t("header.search")}</Link></li>
                        <li><Link to="contribute" className="hover:underline cursor-pointer">{t("header.contribute")}</Link></li>
                        {isAuthenticated ? (
                            <>
                                <li><Link to="/collection" className="hover:underline">{t("header.collection")}</Link></li>
                                {user?.isAdmin && <li><Link to="/users" className="hover:underline">{t("header.users")}</Link></li>}
                                <li><Link to="/profile" className="hover:underline">{t("header.profile")}</Link></li>
                            </>
                        ) : (
                            <>
                                <li><p className="hover:underline cursor-pointer" onClick={openLoginModal}>{t("header.login")}</p></li>
                                <li><p className="hover:underline cursor-pointer" onClick={openSignupModal}>{t("header.signup")}</p></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
            {/* Modals */}
            <LoginModal isOpen={isLoginOpen} onDone={() => setIsLoginOpen(false)} onCancel={() => setIsLoginOpen(false)} />
            <SignupModal isOpen={isSignupOpen} onDone={() => setIsSignupOpen(false)} onCancel={() => setIsSignupOpen(false)} />
        </header>
    );
}