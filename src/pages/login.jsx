import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { loginUser } from "../services/auth";
import zod from "zod";
import FormField from "../components/form";
import { PrimaryButton } from "../components/primaryButton";
import { useDispatch } from "react-redux";
import { profileUserIdSet } from "../context/profileSlice";

const loginSchema = zod.object({
  // Require a valid email address before sending credentials to the server.
  email: zod.string().email("Invalid email address"),
  // Apply the minimum password length used by this app's login form.
  password: zod.string().min(6, "Password must be at least 6 characters")
});

// Validate the submitted values and surface validation failures to the form handler.
async function validateLogin(email, password) {
  try {
    // Parse both fields together so Zod checks the complete credential object.
    await loginSchema.parseAsync({ email, password });
  } catch (error) {
    // Preserve the original Zod error as the cause for debugging.
    throw new Error(error.issues[0].message, { cause: error });
  }
}


function Login() {

  // Get the router helper for navigation after successful authentication.
  const navigate = useNavigate();
  // Get Redux dispatch to save the authenticated user's ID globally.
  const dispatch = useDispatch();

  // Handle form submission, authenticate the user, and route them into the app.
  const handleLogin = async (event) => {
    // Prevent the browser from reloading the page for a native form submission.
    event.preventDefault();

    // Read the named email and password inputs from the submitted form.
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Reject malformed credentials before making a network request.
      await validateLogin(email, password);
      // Authenticate with the backend and capture its response.
      const loginResult = await loginUser({ email, password });
      // Require a user ID because the profile page needs it to load the account profile.
      if (typeof loginResult?.tokens?.userId !== "string" || !loginResult.tokens.userId) {
        throw new Error("Login response did not include a userId.");
      }
      // Save the current user's ID in Redux so other pages can use it.
      dispatch(profileUserIdSet(loginResult.tokens.userId));
      try {
        // Keep the non-secret user ID across a browser refresh in this tab.
        sessionStorage.setItem("researchhub-user-id", loginResult.tokens.userId);
      } catch {
        // Login can still proceed when browser storage is unavailable.
        console.warn("Could not save the user ID for profile loading after refresh.");
      }
      // Navigate only after credentials and the required user ID are confirmed.
      navigate("/home");
    } catch (error) {
      // Report validation, network, or unexpected response failures for debugging.
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
