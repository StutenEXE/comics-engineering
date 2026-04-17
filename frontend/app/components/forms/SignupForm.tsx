import type { SignupData } from "~/models/user";
import { useSignupMutation } from "~/store/services/api";
import { setUser } from "~/store/slices/userSlice";
import { store } from "~/store/store";
import { useToast } from "../toast/Toast";
import { useTranslation } from "~/i18n/i18n";

type SignupFormProps = {
    onDone?: () => void;
    onCancel?: () => void;
};

export function SignupForm({ onDone, onCancel }: SignupFormProps) {
    const { t } = useTranslation();

    const [signup] = useSignupMutation();
    const toast = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");

        if (!username || !email || !password 
            || username === "" || email === "" || password === ""
        ) {
            toast.error(t("signup.error.emptyFields"));
            return;
        }   

        const data: SignupData = {
            username: username as string,
            email: email as string,
            password: password as string,
        };

        if (!data.email || !data.password || !data.username) return;

        // Perform login mutation
        signup(data).unwrap()
            .then((response) => {
                store.dispatch(setUser(response.user));
                toast.success(t("signup.success"));
                // Execute onDone callback if provided
                if (onDone) onDone();
            })
            .catch((error) => {
                const msg = error.data?.error || t("signup.error");
                toast.error(String(msg));
            });
        
    };

    const handleCancel = () => {
        // Execute onCancel callback if provided
        if (onCancel) onCancel();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md bg-black"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">{t("signup.header")}</h2>
            <div className="mb-4">
                <label htmlFor="username" className="block font-semibold mb-2">{t("signup.username")}</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("signup.placeholder.username")}
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-2">{t("signup.email")}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("signup.placeholder.email")}
                    required
                />
            </div>
            <div className="mb-6">
                <label htmlFor="password" className="block font-semibold mb-2">{t("signup.password")}</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("signup.placeholder.password")}
                    required
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-30 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 transition"
                >
                    {t("generic.cancel", { capitalize: true })}
                </button>
                <button
                    type="submit"
                    className="w-30 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                    {t("signup.submit")}
                </button>
            </div>

        </form>
    );
}