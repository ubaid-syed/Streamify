import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import useLogout from "../hooks/useLogout.js";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="flex items-center gap-2.5 pr-8">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
                <ShipWheelIcon className="size-9 text-primary drop-shadow-sm" />
                <span className="text-2xl sm:text-3xl font-extrabold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-widest">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link to="/notifications" className="relative group">
              <button
                className="btn btn-ghost btn-circle hover:bg-neutral/10 transition group-hover:scale-105"
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6 text-base-content opacity-80 group-hover:text-primary transition" />
                {/* <span className="absolute top-2 right-2 rounded-full bg-error text-white text-xs px-1 leading-3 font-bold">2</span> */}
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar mx-1">
              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-md overflow-hidden">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle hover:bg-error/20 transition"
              onClick={logoutMutation}
              aria-label="Logout"
              title="Logout"
            >
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70 hover:text-error transition" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;