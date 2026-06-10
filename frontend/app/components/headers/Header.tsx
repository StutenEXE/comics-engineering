import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import { store, type RootState } from "~/store/store";
import { LoginModal } from "../modals/LoginModal";
import { SignupModal } from "../modals/SignupModal";
import { MdLogout } from "react-icons/md";
import { clearUser } from "~/store/slices/userSlice";
import { useLazyDisconnectQuery } from "~/store/services/api";
import { AppVersionBadge } from "../badges/AppVersionBadge";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user,
  );

  const [disconnect] = useLazyDisconnectQuery();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLoginModal = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };
  const openSignupModal = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  return (
    <>
      <header className="w-full border-b border-white/10 bg-neutral-900/80 backdrop-blur-md text-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-3">
          {/* Brand */}
          <Link className="flex items-center gap-3 shrink-0" to={"/"}>
            <img
              src="/kystash-logo.png"
              alt="logo"
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col items-center">
              <span className="text-xl font-semibold tracking-wide text-white/80">
                <span className="text-yellow-400">K</span>now{" "}
                <span className="text-yellow-400">Y</span>our{" "}
                <span className="text-yellow-400">S</span>tash
              </span>
              <div>
                <AppVersionBadge version="Version 0.0" />
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {/* Public links */}
            {[
              { to: "/", label: t("header.home") },
              { to: "/search", label: t("header.search") },
              { to: "/contribute", label: t("header.contribute") },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 text-md text-white/50 rounded-md hover:bg-white/5 hover:text-white/80 transition-all"
              >
                {label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                {/* Divider */}
                <span className="w-px h-4 bg-white/10 mx-1" />

                {/* User links */}
                {[{ to: "/collection", label: t("header.collection") }].map(
                  ({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="px-3 py-1.5 text-md text-cyan-400/70 rounded-md hover:bg-cyan-400/10 hover:text-cyan-400 transition-all"
                    >
                      {label}
                    </Link>
                  ),
                )}

                {/* Admin links */}
                {user?.isAdmin && (
                  <>
                    <span className="w-px h-4 bg-white/10 mx-1" />
                    {/* Admin links */}
                    {[
                      { to: "/users", label: t("header.users") },
                      {
                        to: "/contributions",
                        label: t("header.contributions"),
                      },
                    ].map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="px-3 py-1.5 text-md text-amber-400/70 rounded-md hover:bg-amber-400/10 hover:text-amber-400 transition-all"
                      >
                        {label}
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-white/30">
                  {t("header.welcome")},{" "}
                  <a
                    className="text-white/60 font-medium cursor-pointer hover:underline"
                    href={`/profile`}
                  >
                    {user?.username}
                  </a>
                </span>
                <span className="w-px h-4 bg-white/10" />
                <button
                  onClick={() => {
                    disconnect({}).then(() => store.dispatch(clearUser()));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/40 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-all  cursor-pointer"
                >
                  <MdLogout size={15} />
                  <span className="text-xs">{t("header.logout")}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="px-3 py-1.5 text-sm text-white/50 rounded-md cursor-pointer hover:bg-white/5 hover:text-white/80 transition-all"
                >
                  {t("header.login")}
                </button>
                <button
                  onClick={openSignupModal}
                  className="px-3 py-1.5 text-sm bg-indigo-600 cursor-pointer hover:bg-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-900/40"
                >
                  {t("header.signup")}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <LoginModal
        isOpen={isLoginOpen}
        onDone={() => setIsLoginOpen(false)}
        onCancel={() => setIsLoginOpen(false)}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onDone={() => setIsSignupOpen(false)}
        onCancel={() => setIsSignupOpen(false)}
      />
    </>
  );
}
