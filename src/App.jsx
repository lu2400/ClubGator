import { useState, useEffect } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";
import {
  registerPlayer,
  loginPlayer,
  logoutPlayer,
  subscribeToAuthState,
} from "./services/authService";
import { getPlayerPenguin, createPenguin } from "./services/penguinService";
// import { signOut } from "firebase/auth";
// import { auth } from "./firebase";

export default function App() {
  const [page, setPage] = useState("login");
  const [session, setSession] = useState({user: null, profile: null});
  const [penguin, setPenguin] = useState(null);
  const [loading, setLoading] = useState(true);

  // automatically detect persistent session on page load/refresh
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (authSession) => {
      setSession(authSession);
      if (authSession?.user) {
        const savedPenguin = await getPlayerPenguin(authSession.user.uid);
        setPenguin(savedPenguin);
      } else {
        setPenguin(null);
      }
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

  // Logged-in screen shows loaded penguin data
  if (session.user) {
    return (
      <main className="cg-scene" style={{ display: "grid", placeItems: "center", color: "white" }}>
        <section className="cg-panel" style={{ textAlign: "center", maxWidth: "420px" }}>
          <h2 className="cg-panel-title">Welcome back!</h2>
          <p style={{ margin: "0.5rem 0" }}>
            Logged in as: <strong>{session.profile?.username || session.user.email}</strong>
          </p>

          <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "8px", margin: "1rem 0" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Penguin Status</h3>
            {penguin ? (
              <p style={{ color: "#86efac" }}>
                Penguin Profile Active (Schema v{penguin.schemaVersion})
              </p>
            ) : (
              <div>
                <p style={{ color: "#fca5a5", marginBottom: "0.75rem" }}>No penguin found for this account.</p>
                <button
                  className="cg-button"
                  type="button"
                  onClick={async () => {
                    const newPenguin = await createPenguin();
                    setPenguin(newPenguin);
                  }}
                >
                  Create Starter Penguin
                </button>
              </div>
            )}
          </div>

          <button
            className="cg-button"
            type="button"
            style={{ background: "#475569" }}
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
  }

  // unauthenticated routing
  return page === "login" ? (
    <LoginPage
      onLogin={async ({email, password}) => {
        const result = await loginPlayer({email, password});
        const savedPenguin = await getPlayerPenguin(result.user.uid);
        setSession(result);
        setPenguin(savedPenguin);
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