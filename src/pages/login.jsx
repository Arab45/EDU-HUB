import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/Form";
import { PrimaryButton } from "../components/PrimaryButton";

function Login() {
  return (
    <AuthShell>
      <p className="mb-6 text-center font-serif text-2xl font-bold text-slate-900">
        Login
      </p>

      <FormField
        label="Email"
        type="email"
        placeholder="jane.smith@university.edu"
      />

      <FormField label="Password" type="password" placeholder="******" />
      <div className="-mt-3 mb-4 text-right">
        <Link
          to="/forgot-password"
          className="text-sm text-emerald-700 transition-colors duration-300 ease-in-out hover:text-emerald-900"
        >
          Forgot password?
        </Link>
      </div>

      <PrimaryButton to="/home" className="mt-2 w-full">
        Sign In
      </PrimaryButton>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/onboarding"
          className="font-semibold text-emerald-700 transition-colors duration-300 ease-in-out hover:text-emerald-900"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}

export default Login;
