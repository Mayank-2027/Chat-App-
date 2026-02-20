import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LogIn,
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

export const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <header className="bg-base-100 border-b border-base-300">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Chatty</h1>
          </Link>

          <div className="flex items-center gap-2">
            <NavLink
              to="/setting"
              className={({ isActive }) =>
                `btn btn-sm gap-2 ${isActive ? "btn-primary" : "btn-ghost"}`
              }
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </NavLink>

            {isAuthPage ? null : authUser ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `btn btn-sm gap-2 ${isActive ? "btn-primary" : "btn-ghost"}`
                  }
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>

                <button onClick={logout} className="btn btn-sm btn-ghost gap-2" type="button">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `btn btn-sm gap-2 ${isActive ? "btn-primary" : "btn-ghost"}`
                  }
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </NavLink>

                <NavLink to="/signup" className="btn btn-sm btn-primary gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
