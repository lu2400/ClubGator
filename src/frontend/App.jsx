import RegisterPage from "./RegisterPage";

export default function App() {
    return (
    <RegisterPage
    onRegister={async (data) => console.log("register", data)}
    onSwitchToLogin={() => console.log("go to login")}
    />
    );
}