import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/Form";
import { PrimaryButton } from "../components/PrimaryButton";
import { loginUser } from "../services/auth";
import zod from "zod";

const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters")
});

async function validateLogin(email, password) {
  try {
    await loginSchema.parseAsync({ email, password });
  } catch (error) {
    throw new Error(error.issues[0].message);
  }
}
  // Additional validation logic can be added here (e.g., regex for email format)


function Login() {
  
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await validateLogin(email, password);
      await loginUser({ email, password });
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <AuthShell>
      <p className="mb-6 text-center font-serif text-2xl font-bold text-slate-900">
        Login
      </p>

      <form onSubmit={handleLogin}>
        <FormField
          label="Email"
          type="email"
          name="email"
          placeholder="jane.smith@university.edu"
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          placeholder="******"
        />

        <div className="-mt-3 mb-4 text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-emerald-700 hover:text-emerald-900"
          >
            Forgot password?
          </Link>
        </div>

        <PrimaryButton
          type="submit"
          className="mt-2 w-full"
        >
          Sign In
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/onboarding"
          className="font-semibold text-emerald-700"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}


export default Login;
