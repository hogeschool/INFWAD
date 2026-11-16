import { Link, Outlet } from "react-router";
import { useAuth } from "../auth/authContext";
import styles from "./Layout.module.css";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <nav className={styles["mainmenu"]}>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {user ? (
            <button onClick={logout}>Log out ({user.username})</button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
