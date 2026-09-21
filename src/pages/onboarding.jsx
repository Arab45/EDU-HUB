import { useState } from "react";
import { GiArchiveResearch } from "react-icons/gi";
import { FcGraduationCap } from "react-icons/fc";
import AuthShell from "../components/AuthShell";
import { PrimaryButton } from "../components/PrimaryButton";


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
  const [role, setRole] = useState(null);

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

        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            icon={<GiArchiveResearch className="text-3xl text-emerald-800" />}
            title="Researcher"
            description="Share your work, find collaborators"
            selected={role === "researcher"}
            onClick={() => setRole("researcher")}
          />
          <RoleCard
            icon={<FcGraduationCap className="text-3xl" />}
            title="Student"
            description="Explore projects, gain experience"
            selected={role === "student"}
            onClick={() => setRole("student")}
          />
        </div>

        {/* Link handles the actual navigation; disabled falls back to a plain button until a role is picked */}
        <PrimaryButton to="/signup" disabled={!role}>
          Continue
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}

export default Onboarding;
