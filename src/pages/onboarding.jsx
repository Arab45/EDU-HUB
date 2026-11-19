import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiArchiveResearch } from "react-icons/gi";
import { FcGraduationCap } from "react-icons/fc";
import AuthShell from "../components/AuthShell";
import { PrimaryButton } from "../components/primaryButton";

const ONBOARDING_ROLE_KEY = "researchhub-onboarding-role";
const ROLES = ["researcher", "student"];

function getSavedRole() {
  try {
    const savedRole = sessionStorage.getItem(ONBOARDING_ROLE_KEY);
    return ROLES.includes(savedRole) ? savedRole : null;
  } catch {
    return null;
  }
}

function RoleCard({ icon, title, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-44 flex-col items-center justify-center gap-1 rounded-xl border p-4 text-center transition-colors duration-300 ease-in-out ${
        selected
          ? "border-emerald-600 bg-emerald-50"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      {icon}
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState(getSavedRole);
  const [roleStorageError, setRoleStorageError] = useState("");

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    try {
      sessionStorage.setItem(ONBOARDING_ROLE_KEY, selectedRole);
      setRoleStorageError("");
    } catch {
      setRoleStorageError(
        "Your selected account type could not be saved if you refresh this page."
      );
    }
  };

  return (
    <AuthShell currentStep={1}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="font-serif text-2xl font-bold text-slate-900">
            Join as a...
          </p>
          <p className="text-slate-500">
            Select the role that best describes you
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RoleCard
            icon={<GiArchiveResearch className="text-3xl text-emerald-800" />}
            title="Researcher"
            description="Share your work, find collaborators"
            selected={role === "researcher"}
            onClick={() => selectRole("researcher")}
          />
          <RoleCard
            icon={<FcGraduationCap className="text-3xl" />}
            title="Student"
            description="Explore projects, gain experience"
            selected={role === "student"}
            onClick={() => selectRole("student")}
          />
        </div>

        {roleStorageError && (
          <p role="alert" className="text-sm text-amber-700">
            {roleStorageError}
          </p>
        )}
        <PrimaryButton
          disabled={!role}
          onClick={() => navigate("/signup", { state: { role } })}
        >
          Continue
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}

export default Onboarding;
