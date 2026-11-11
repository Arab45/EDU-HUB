import { useState, useEffect } from "react";
import AuthShell from "../components/AuthShell";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton";
import FormField from "../components/Form";
import TagInputField from "../components/TagInput";
import zod from "zod";
import { signUpUser } from "../services/auth";


const LAST_STEP = 4;
const SIGNUP_DRAFT_KEY = "researchhub-signup-draft";

// Keep the initial values in one place so a new signup and a restored draft
// always start with the same shape.
const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  institution: "",
  position: "",
  bio: "",
  interests: [],
  researchFocus: "",
};

// Validate stored data before using it, since browser storage can be stale or edited.
const signupDraftSchema = zod.object({
  step: zod.number().int().min(2).max(LAST_STEP),
  form: zod.object({
    fullName: zod.string(),
    email: zod.string(),
    phone: zod.string(),
    institution: zod.string(),
    position: zod.string(),
    bio: zod.string(),
    interests: zod.array(zod.string()),
    researchFocus: zod.string(),
  }),
});

function readSignupDraft() {
  try {
    // Load the draft from this tab; no saved draft means a clean start.
    const savedDraft = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!savedDraft) {
      return { step: 2, form: emptyForm, notice: "" };
    }

    // Parse and validate the stored JSON before restoring it into React state.
    const result = signupDraftSchema.safeParse(JSON.parse(savedDraft));
    if (!result.success) {
      // Remove invalid or outdated data so it does not break future attempts.
      sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
      return {
        step: 2,
        form: emptyForm,
        notice: "Your saved signup draft could not be restored. Please start again.",
      };
    }

    // Restore the last step and fields; the password is deliberately not stored.
    return {
      step: result.data.step,
      form: { ...emptyForm, ...result.data.form },
      notice: "Your progress was restored. For your security, passwords aren't saved; re-enter yours on step 2 before submitting.",
    };
  } catch {
    // Storage may be unavailable or contain malformed JSON; recover with a clean form.
    return {
      step: 2,
      form: emptyForm,
      notice: "Your signup progress could not be read from this browser session.",
    };
  }
}

function validateForm(form) {
  // Apply the signup requirements to all fields together before making the API call.
  const schema = zod.object({
    fullName: zod.string().min(1, "Full Name is required"),
    email: zod.string().email("Invalid email address"),
    phone: zod.string().min(1, "Phone Number is required"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    institution: zod.string().min(1, "Institution is required"),
    position: zod.string().min(1, "Position / Role is required"),
    bio: zod.string().optional(),
    interests: zod.array(zod.string().min(1, "Interest is required")),
    researchFocus: zod.string().optional(),
  });

  return schema.safeParse(form);
}

// Fades each step's content in when the step changes, instead of a hard cut.
function StepTransition({ stepKey, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Restart the fade whenever the active signup step changes.
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 20);
    // Cancel an unfinished timer if the step changes again or the component unmounts.
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
  // Read the browser draft once so refreshes restore both the active step and form.
  const [initialDraft] = useState(readSignupDraft);
  const [step, setStep] = useState(initialDraft.step);
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftNotice] = useState(initialDraft.notice);
  const [draftError, setDraftError] = useState("");
  const [form, setForm] = useState(initialDraft.form);

  // Store only non-sensitive fields so progress survives a refresh without saving a password.
  const saveDraft = (nextStep, nextForm) => {
    const savedForm = {
      fullName: nextForm.fullName,
      email: nextForm.email,
      phone: nextForm.phone,
      institution: nextForm.institution,
      position: nextForm.position,
      bio: nextForm.bio,
      interests: nextForm.interests,
      researchFocus: nextForm.researchFocus,
    };
    try {
      sessionStorage.setItem(
        SIGNUP_DRAFT_KEY,
        JSON.stringify({ step: nextStep, form: savedForm })
      );
      setDraftError("");
    } catch {
      setDraftError("Your progress could not be saved in this browser session.");
    }
  };

  // Update the edited field, persist the new draft, and clear any previous validation message.
  const update = (field) => (e) => {
    const updatedForm = { ...form, [field]: e.target.value };
    setForm(updatedForm);
    saveDraft(step, updatedForm);
    setSignupError("");
  };

  // Move to the previous step and save that step so refresh returns to the same place.
  const goBack = () => {
    const previousStep = step - 1;
    setStep(previousStep);
    saveDraft(previousStep, form);
  };

  // Advance no further than the final step and persist the updated location.
  const goNext = () => {
    const nextStep = Math.min(step + 1, LAST_STEP);
    setStep(nextStep);
    saveDraft(nextStep, form);
  };

  // Validate all fields, submit valid data, and show success or a recoverable error.
  const handleComplete = async () => {
    const validation = validateForm(form);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      if (firstIssue?.path[0] === "password") {
        // Password is intentionally excluded from the draft, so send the user back to enter it.
        setStep(2);
        saveDraft(2, form);
      }
      setSignupError(firstIssue?.message ?? "Please check your information.");
      return;
    }

    setIsSubmitting(true);
    setSignupError("");
    try {
      // Wait for the server to accept the signup before showing the success screen.
      await signUpUser(form);
      setSubmitted(true);
      try {
        // The account exists now, so remove the resumable draft.
        sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
      } catch {
        // Do not undo a successful signup if browser storage cannot be cleared.
        setDraftError("Your account was created, but the saved signup draft could not be cleared.");
      }
    } catch (error) {
      // Keep the draft intact and display the request failure so the user can retry.
      setSignupError(
        error instanceof Error ? error.message : "Unable to create your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the confirmation only after the signup API call succeeds.
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
          {draftError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {draftError}
            </p>
          )}
          <PrimaryButton to="/home" className="mt-8">
            Go to Dashboard
          </PrimaryButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell currentStep={step}>
      {/* Show only the fields belonging to the current step. */}
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
              onChange={(interests) => {
                // Tags use an array rather than a text input, so persist them separately.
                const updatedForm = { ...form, interests };
                setForm(updatedForm);
                saveDraft(step, updatedForm);
                setSignupError("");
              }}
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

      {/* Distinguish storage problems/restoration messages from signup validation errors. */}
      {(draftNotice || draftError) && (
        <p
          role={draftError ? "alert" : "status"}
          className={`mt-4 text-sm ${draftError ? "text-red-600" : "text-slate-600"}`}
        >
          {draftError || draftNotice}
        </p>
      )}

      {/* Keep validation and server errors visible until the user edits a field. */}
      {signupError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {signupError}
        </p>
      )}

      {/* Use navigation controls for earlier steps and submit only on the final step. */}
      <div className="mt-4 flex gap-3">
        {step === 2 ? (
          <SecondaryButton to="/onboarding">Back</SecondaryButton>
        ) : (
          <SecondaryButton onClick={goBack}>Back</SecondaryButton>
        )}
        {step < LAST_STEP ? (
          <PrimaryButton className="flex-1" onClick={goNext}>
            Continue
          </PrimaryButton>
        ) : (
          <PrimaryButton className="flex-1" onClick={handleComplete} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Complete Signup"}
          </PrimaryButton>
        )}
      </div>
    </AuthShell>
  );
}

export default Signup;
