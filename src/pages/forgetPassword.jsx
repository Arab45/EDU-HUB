import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { PrimaryButton } from "../components/PrimaryButton";
import FormField from "../components/Form";

// Stand-in for a backend "does this email exist" check.
const MOCK_REGISTERED_EMAILS = [
  "jane.smith@university.edu",
  "amara.chukwu@cu.edu.ng",
];

function ForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleCheckEmail = () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setChecking(true);
    // Replace this timeout with a real API call once the backend is ready.
    setTimeout(() => {
      setChecking(false);
      const exists = MOCK_REGISTERED_EMAILS.includes(
        email.trim().toLowerCase()
      );
      if (exists) {
        setStep("reset");
      } else {
        setError("We couldn't find an account with that email.");
      }
    }, 600);
  };

  const handleReset = () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    // Replace this with a real API call once the backend is ready.
    setStep("done");
  };

  if (step === "done") {
    return (
      <AuthShell>
        <div className="text-center">
          <span className="mb-4 inline-block text-5xl">✅</span>
          <p className="font-serif text-2xl font-bold text-slate-900">
            Password updated
          </p>
          <p className="mt-3 text-slate-500">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
          <PrimaryButton to="/login" className="mt-8">
            Back to login
          </PrimaryButton>
        </div>
      </AuthShell>
    );
  }

  if (step === "reset") {
    return (
      <AuthShell>
        <p className="font-serif text-2xl font-bold text-slate-900">
          Create new password
        </p>
        <p className="mb-6 text-slate-500">
          Choose a new password for <span className="font-medium">{email}</span>
        </p>

        <FormField
          label="New Password *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
        />
        <FormField
          label="Confirm Password *"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <PrimaryButton onClick={handleReset} className="w-full">
          Reset password
        </PrimaryButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <p className="font-serif text-2xl font-bold text-slate-900">
        Forgot password
      </p>
      <p className="mb-6 text-slate-500">
        Enter the email linked to your account and we'll check if it exists
      </p>

      <FormField
        label="Email *"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane.smith@university.edu"
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <PrimaryButton
        onClick={handleCheckEmail}
        disabled={checking}
        className="w-full"
      >
        {checking ? "Checking..." : "Continue"}
      </PrimaryButton>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-emerald-700 transition-colors duration-300 ease-in-out hover:text-emerald-900"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default ForgotPassword;
