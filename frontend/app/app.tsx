import { Outlet } from "react-router";
import { Header } from "./components/headers/Header";
import { useRefreshQuery } from "./store/services/api";
import { clearUser, setUser } from "./store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useAppSelector } from "./store/hooks";

export default function App() {
  let firstLoad = true;
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isLoading, isSuccess, isError } = useRefreshQuery(
    {},
    {
      skip: !isAuthenticated && !firstLoad, // Skip the refresh query if the user is not authenticated and it's not the first load
      refetchOnReconnect: true, // Refetch when the browser regains network connections
      pollingInterval: 15 * 60 * 1000, // Poll every 15 minutes (automatic token refresh)
    }, 
  );
  const dispatch = useDispatch();

  // Run once when refresh gives result
  useEffect(() => {
    firstLoad = false;
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
    }
    // Clear user state if refresh fails (not authenticated)
    if (isError) {
      dispatch(clearUser());
    }
  }, [isSuccess, isError, data]);

  // Only show loading on initial load, not on background refetches
  if (isLoading) {
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
