import type { UserCredentials } from "~/models/user";
import { useLoginMutation } from "~/store/services/api";
import { setUser } from "~/store/slices/userSlice";
import { store } from "~/store/store";
import { useToast } from "../toast/Toast";

type LoginFormProps = {
    onDone?: () => void;
    onCancel?: () => void;
};

export function LoginForm({ onDone, onCancel }: LoginFormProps) {
    const [login] = useLoginMutation();
    const toast = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
                toast.success("Login successful");
                // Execute onDone callback if provided
                if (onDone) onDone();
            })
            .catch((error) => {
                const msg = error.data?.error || 'Invalid email or password';
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
            <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
            <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div className="mb-6">
                <label htmlFor="password" className="block font-semibold mb-2">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    required
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-30 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="w-30 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                    Login
                </button>
            </div>

        </form>
    );
}