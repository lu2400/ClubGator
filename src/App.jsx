import { useState, useEffect } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";
import {
  registerPlayer,
  loginPlayer,
  logoutPlayer,
  subscribeToAuthState,
} from "./services/authService";
// import { signOut } from "firebase/auth";
// import { auth } from "./firebase";

export default function App() {
  const [page, setPage] = useState("login");
  const [session, setSession] = useState({user: null, profile: null});
  const [loading, setLoading] = useState(true);

  // automatically detect persistent session on page load/refresh
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authSession) => {
      setSession(authSession);
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <main className="cg-scene" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "white", fontSize: "1.2rem" }}>Loading Club Gator...</p>
      </main>
    );
  }

  // placeholder logged in screen, can be changed later
  if (session.user) {
    return (
      <main className="cg-scene" style={{ display: "grid", placeItems: "center", color: "white" }}>
        <section className="cg-panel" style={{ textAlign: "center" }}>
          <h2 className="cg-panel-title">Welcome back!</h2>
          <p style={{ margin: "1rem 0" }}>
            Logged in as: <strong>{session.profile?.username || session.user.email}</strong>
          </p>
          <button
            className="cg-button"
            type="button"
            onClick={async () => {
              await logoutPlayer();
              setPage("login");
            }}
          >
            Log out
          </button>
        </section>
      </main>
    );
  }

  // unauthenticated routing
  return page === "login" ? (
    <LoginPage
      onLogin={async ({email, password}) => {
        const result = await loginPlayer({email, password});
        setSession(result);
      }}
      onSwitchToRegister={() => setPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={async (data) => {
        const { profile } = await registerPlayer(data);

        await logoutPlayer();

        window.alert(
          `Account created! Welcome, ${profile.username}. Please log in.`
        );

        setPage("login"); //redirect user to login page
      }}
      onSwitchToLogin={() => setPage("login")}
    />
  );
}
