import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import PrimaryButton from "../components/primaryButton";
import FormField from "../components/form";
import TagInputField from "../components/TagInput";

const LAST_STEP = 4;

// Fades each step's content in when the step changes, instead of a hard cut.
function StepTransition({ stepKey, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timer);
  }, [stepKey]);

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    institution: "",
    position: "",
    bio: "",
    interests: [],
    researchFocus: "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const goBack = () => {
    if (step === 2) {
      navigate("/onboarding");
    } else {
      setStep((s) => s - 1);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, LAST_STEP));
  const handleComplete = () => setSubmitted(true);

  if (submitted) {
    return (
      <AuthShell currentStep={LAST_STEP}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 text-5xl">🎉</span>
          <p className="font-serif text-3xl font-bold text-slate-900">
            Welcome to ResearchHub!
          </p>
          <p className="mt-3 max-w-sm text-slate-500">
            Your account has been created successfully. Check your email to
            verify your account.
          </p>
          <PrimaryButton
            className="mt-8"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </PrimaryButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell currentStep={step}>
      <StepTransition stepKey={step}>
        {step === 2 && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Basic Information
            </p>
            <p className="mb-6 text-slate-500">
              Let's start with the essentials
            </p>
            <FormField
              label="Full Name *"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Jane Smith"
            />
            <FormField
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="jane.smith@university.edu"
            />
            <FormField
              label="Phone Number *"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="123-456-7890"
            />
            <FormField
              label="Password *"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="Create a strong password"
            />
          </>
        )}

        {step === 3 && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Profile Details
            </p>
            <p className="mb-6 text-slate-500">
              Tell us where you work and what you do
            </p>
            <FormField
              label="Institution *"
              value={form.institution}
              onChange={update("institution")}
              placeholder="University of Lagos"
            />
            <FormField
              label="Position / Role *"
              value={form.position}
              onChange={update("position")}
              placeholder="PhD Candidate, Postdoc, Professor..."
            />
            <FormField
              label="Short Bio"
              textarea
              value={form.bio}
              onChange={update("bio")}
              placeholder="A sentence or two about your background..."
            />
          </>
        )}

        {step === 4 && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Research Interests
            </p>
            <p className="mb-6 text-slate-500">
              What areas are you passionate about?
            </p>
            <TagInputField
              label="Areas of Interest *"
              hint="Add 3-5 research areas or topics you're interested in"
              value={form.interests}
              onChange={(interests) => setForm((f) => ({ ...f, interests }))}
              placeholder="Type and press Enter..."
            />
            <FormField
              label="Brief Research Focus"
              textarea
              value={form.researchFocus}
              onChange={update("researchFocus")}
              placeholder="In 1-2 sentences, describe your research focus or interests..."
            />
          </>
        )}
      </StepTransition>

      <div className="mt-4 flex gap-3">
        <SecondaryButton onClick={goBack}>Back</SecondaryButton>
        {step < LAST_STEP ? (
          <PrimaryButton className="flex-1" onClick={goNext}>
            Continue
          </PrimaryButton>
        ) : (
          <PrimaryButton className="flex-1" onClick={handleComplete}>
            Complete Signup
          </PrimaryButton>
        )}
      </div>
    </AuthShell>
  );
}

export default Signup;
