import PhaserGame from "./game/PhaserGame";
import { useState, useEffect } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";
import { auth } from "./firebase";
import {
  registerPlayer,
  loginPlayer,
  logoutPlayer,
  subscribeToAuthState,
} from "./services/authService";
import { getPlayerPenguin, createPenguin } from "./services/penguinService";

export default function App() {
  const [page, setPage] = useState("login");
  const [session, setSession] = useState({user: null, profile: null});
  const [penguin, setPenguin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPenguin, setCreatingPenguin] = useState(false);
  const [penguinError, setPenguinError] = useState("");

  // automatically detect persistent session on page load
  useEffect(() => {
    let active = true;
    let latestRequest = 0;

    const unsubscribe = subscribeToAuthState(async (authSession) => {
      const uid = authSession.user?.uid ?? null;

      //ignore an outdated profile request that finished after logout.
      if (!active || (auth.currentUser?.uid ?? null) !== uid) return;

      const request = ++latestRequest;

      setSession(authSession);
      setPenguin(null);
      setPenguinError("");

      if (!authSession.user || !authSession.profile) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const savedPenguin = await getPlayerPenguin(uid);

        if (
          active &&
          request === latestRequest &&
          auth.currentUser?.uid === uid
        ) {
          setPenguin(savedPenguin);
        }
      } catch {
        if (
          active &&
          request === latestRequest &&
          auth.currentUser?.uid === uid
        ) {
          setPenguinError(
            "Couldn't load your penguin. Refresh to try again."
          );
        }
      } finally {
        if (
          active &&
          request === latestRequest &&
          (auth.currentUser?.uid ?? null) === uid
        ) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      latestRequest++;
      unsubscribe();
    };
  }, []);
  async function handleLogout() {
  try {
    await logoutPlayer();

    setSession({ user: null, profile: null });
    setPenguin(null);
    setPenguinError("");
    setCreatingPenguin(false);
    setLoading(false);
    setPage("login");
  } catch {
    setPenguinError("Couldn't log out. Please try again.");
  }
  }
  if (loading) {
    return (
      <main className="cg-scene" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "white", fontSize: "1.2rem" }}>Loading Club Gator...</p>
      </main>
    );
  }

  //logged-in screen shows loaded penguin data and loaded campus map
  if (session.user && !session.profile && page !== "register") {
    return (
      <main className="cg-scene">
        <section className="cg-content">
          <h1 className="cg-title">Club Gator</h1>

          <div className="cg-panel">
            <h2 className="cg-panel-title">Finish registration</h2>

            <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
              Your account setup is incomplete. Return to registration
              and use the same email with an available username.
            </p>

            <div style={{ display: "grid", gap: "20px" }}>
              <button
                className="cg-button"
                type="button"
                onClick={() => setPage("register")}
              >
                Finish registration
              </button>

              <button
                className="cg-button"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>

            {penguinError && (
              <p
                className="cg-error"
                role="alert"
                style={{ marginTop: "20px" }}
              >
                {penguinError}
              </p>
            )}
          </div>
        </section>

        <div className="cg-ground" aria-hidden="true" />
      </main>
    );
  }
  //easier to test map functionality this way; down the line change this so that penguin creation screen is separate from the campus map screen
  if (session.user && page !== "register") {
    return (
      <main className="cg-scene" style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", overflowY: "auto", padding: "2rem 1rem", color: "white" }}>
        <section className="cg-panel" style={{ textAlign: "center", width: "100%", maxWidth: "420px", marginBottom: "1rem" }}>
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
                  disabled={creatingPenguin}
                  onClick={async () => {
                    if (creatingPenguin) return;
                    setCreatingPenguin(true);
                    setPenguinError("");
                    try {
                      const newPenguin = await createPenguin();
                      setPenguin(newPenguin);
                    } catch {
                      setPenguinError(
                        "Couldn't create your penguin. Check your connection and try again."
                      );
                    } finally {
                      setCreatingPenguin(false);
                    }
                  }}
                >
                  {creatingPenguin ? "Creating..." : "Create Starter Penguin"}
                </button>
                {penguinError && (
                  <p className="cg-error" role="alert">
                    {penguinError}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            className="cg-button"
            type="button"
            style={{ background: "#475569" }}
            onClick={handleLogout}
            disabled={creatingPenguin}
          >
            Log out
          </button>
        </section>
        <PhaserGame />
      </main>
    );
  }

  // unauthenticated routing
  return page === "login" ? (
    <LoginPage
      onLogin={async ({ email, password }) => {
        await loginPlayer({ email, password });
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