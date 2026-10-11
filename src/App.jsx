import { useState } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";

// temp switch so we can preview both pages
// replace later
export default function App() {
  const [page, setPage] = useState("login");
  return page === "login" ? (
    <LoginPage
      onLogin={async (data) => console.log("login", data)}
      onSwitchToRegister={() => setPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={async (data) => console.log("register", data)}
      onSwitchToLogin={() => setPage("login")}
    />
  );
}
