import { Outlet } from "react-router";
import { Header } from "./components/headers/Header";
import { useRefreshQuery } from "./store/services/api";
import { clearUser, setUser } from "./store/slices/userSlice";
import { useToast } from "./components/toast/Toast";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export default function App() {
  const { data, isLoading, isSuccess, isError } = useRefreshQuery({});
  const dispatch = useDispatch();
  const toast = useToast();

  // run once when refresh gives result
  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
      // toast.success("Login successful"); // Is too much on the screen
    }
    // Optionally: clear user state if refresh fails (not authenticated)
    if (isError) {
      dispatch(clearUser());
    }
  }, [isSuccess, isError, data]);

  // Only show loading on initial load, not on background refetches
  if (isLoading && !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
