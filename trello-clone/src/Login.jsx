import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase/firebase";

function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Trello Clone</h1>

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;