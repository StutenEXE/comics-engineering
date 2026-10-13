import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import { store, type RootState } from "~/store/store";
import { LoginModal } from "../modals/LoginModal";
import { SignupModal } from "../modals/SignupModal";
import { MdLogout, MdMenu } from "react-icons/md";
import { clearUser } from "~/store/slices/userSlice";
import { useLazyDisconnectQuery } from "~/store/services/api";
import { AppVersionBadge } from "../badges/AppVersionBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../shadcn/ui/sheet";

type NavLink = { to: string; label: string };

const linkStyles = {
  public: "text-white/50 hover:bg-white/5 hover:text-white/80",
  user: "text-cyan-400/70 hover:bg-cyan-400/10 hover:text-cyan-400",
  admin: "text-amber-400/70 hover:bg-amber-400/10 hover:text-amber-400",
};

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user,
  );
  const location = useLocation();

  const [disconnect] = useLazyDisconnectQuery();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const openLoginModal = () => {
    setIsMenuOpen(false);
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };
  const openSignupModal = () => {
    setIsMenuOpen(false);
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };
  const logout = () => {
    setIsMenuOpen(false);
    disconnect({}).then(() => store.dispatch(clearUser()));
  };

  const publicLinks: NavLink[] = [
    { to: "/", label: t("header.home") },
    { to: "/search", label: t("header.search") },
    { to: "/contribute", label: t("header.contribute") },
    { to: "/compare", label: t("header.compare") },
  ];
  const userLinks: NavLink[] = isAuthenticated
    ? [{ to: "/stash", label: t("header.stash") }]
    : [];
  const adminLinks: NavLink[] =
    isAuthenticated && user?.isAdmin
      ? [
          { to: "/users", label: t("header.users") },
          { to: "/contributions", label: t("header.contributions") },
        ]
      : [];

  const linkGroups = [
    { links: publicLinks, style: linkStyles.public },
    { links: userLinks, style: linkStyles.user },
    { links: adminLinks, style: linkStyles.admin },
  ].filter((group) => group.links.length > 0);

  return (
    <>
      <header className="w-full border-b border-white/10 bg-neutral-900/80 backdrop-blur-md text-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-2 lg:py-3">
          {/* Brand */}
          <Link className="flex items-center gap-3 shrink-0" to={"/"}>
            <img
              src="/kystash-logo.png"
              alt="logo"
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
            />
            <div className="flex flex-col items-center">
              <span className="text-lg lg:text-xl font-semibold tracking-wide text-white/80">
                <span className="text-yellow-400">K</span>now{" "}
                <span className="text-yellow-400">Y</span>our{" "}
                <span className="text-yellow-400">S</span>tash
              </span>
              <div>
                <AppVersionBadge version="Version 1.0.0" />
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {linkGroups.map(({ links, style }, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <span className="w-px h-4 bg-white/10 mx-1" />}
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-1.5 text-md rounded-md transition-all ${style}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
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
                  onClick={logout}
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label={t("header.menu")}
            className="lg:hidden p-2 -mr-2 text-white/70 rounded-md hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <MdMenu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="right"
          className="bg-neutral-900 border-white/10 text-white w-4/5 max-w-xs"
        >
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <SheetTitle className="text-white/80">{t("header.menu")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("header.menu")}
            </SheetDescription>
            {isAuthenticated && (
              <p className="mt-2 text-sm text-white/40">
                {t("header.welcome")},{" "}
                <Link
                  to="/profile"
                  className="text-white/70 font-medium hover:underline"
                >
                  {user?.username}
                </Link>
              </p>
            )}
          </div>

          <nav className="flex flex-col gap-1 px-3 py-4 overflow-y-auto">
            {linkGroups.map(({ links, style }, i) => (
              <div key={i} className="flex flex-col gap-1">
                {i > 0 && <span className="h-px bg-white/10 my-2 mx-2" />}
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2.5 text-base rounded-md transition-all ${style} ${
                      location.pathname === to ? "bg-white/5" : ""
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 p-4 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-white/50 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
              >
                <MdLogout size={16} />
                {t("header.logout")}
              </button>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="px-3 py-2.5 text-sm text-white/70 border border-white/10 rounded-md cursor-pointer hover:bg-white/5 hover:text-white transition-all"
                >
                  {t("header.login")}
                </button>
                <button
                  onClick={openSignupModal}
                  className="px-3 py-2.5 text-sm bg-indigo-600 cursor-pointer hover:bg-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-900/40"
                >
                  {t("header.signup")}
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
