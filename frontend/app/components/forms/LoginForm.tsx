import type { UserCredentials } from "~/models/user";
import { useLoginMutation } from "~/store/services/api";
import { setUser } from "~/store/slices/userSlice";
import { store } from "~/store/store";
import { useToast } from "../toast/Toast";
import { useTranslation } from "~/i18n/i18n";

type LoginFormProps = {
    onDone?: () => void;
    onCancel?: () => void;
};

export function LoginForm({ onDone, onCancel }: LoginFormProps) {
    const { t } = useTranslation();
    
    const [login] = useLoginMutation();
    const toast = useToast();

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        const credentials: UserCredentials = {
            email: typeof email === "string" ? email : "",
            password: typeof password === "string" ? password : "",
        };

        if (!credentials.email || !credentials.password) return;

        // Perform login mutation
        login(credentials).unwrap()
            .then((response) => {
                store.dispatch(setUser(response.user));
                toast.success(t("login.success"));
                // Execute onDone callback if provided
                if (onDone) onDone();
            })
            .catch((error) => {
                const msg = error.data?.error || t("login.error");
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
            className="w-100 mx-auto mt-8 p-6"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">{t("login.header")}</h2>
            <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-2">{t("login.email")}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("login.placeholder.email")}
                    required
                />
            </div>
            <div className="mb-6">
                <label htmlFor="password" className="block font-semibold mb-2">{t("login.password")}</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("login.placeholder.password")}
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
                    {t("login.submit")}
                </button>
            </div>

        </form>
    );
}