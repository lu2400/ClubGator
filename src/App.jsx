import { useState } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";
import { registerPlayer } from "./services/authService";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

// temp switch so we can preview both pages
// replace later
export default function App() {
  const [page, setPage] = useState("login");
  return page === "login" ? (
    <LoginPage
      onLogin={async () => {
        throw new Error("Login is not connected yet.");
      }}
      onSwitchToRegister={() => setPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={async (data) => {
        const { profile } = await registerPlayer(data);

        await signOut(auth);

        window.alert(
          `Account created! Welcome, ${profile.username}. Please log in.`
        );

        setPage("login"); //redirect user to login page
      }}
      onSwitchToLogin={() => setPage("login")}
    />
  );
}
