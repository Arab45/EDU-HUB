import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/form";
import PrimaryButton from "../components/primaryButton";

function Login() {
  const navigate = useNavigate();

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-sm">
        <p className="mb-6 text-center font-serif text-2xl font-bold text-slate-900">
          Login
        </p>
        <FormField label="Email" type="email" placeholder="jane.smith@university.edu" />
        <FormField label="Password" type="password" placeholder="******" />
        <PrimaryButton className="mt-2 w-full" onClick={() => navigate("/dashboard")}>
          Sign In
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}

export default Login;
