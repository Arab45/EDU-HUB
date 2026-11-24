import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { PrimaryButton, SecondaryButton } from "../components/primaryButton";
import FormField from "../components/form";
import TagInputField from "../components/TagInput";
import zod from "zod";
import {
  saveAcademicStep,
  saveResearchStep,
  signUpUser,
} from "../services/auth";


const LAST_STEP = 4;
const SIGNUP_DRAFT_KEY = "researchhub-signup-draft";
const ONBOARDING_ROLE_KEY = "researchhub-onboarding-role";
const SIGNUP_ROLES = ["student", "researcher"];

// Keep the initial values in one place so a new signup and a restored draft
// always start with the same shape.
const emptyForm = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  institution: "",
  position: "",
  bio: "",
  interests: [],
  researchFocus: "",
};

// Validate stored data before using it, since browser storage can be stale or edited.
const signupDraftSchema = zod.object({
  step: zod.number().int().min(2).max(LAST_STEP),
  role: zod.enum(SIGNUP_ROLES).optional(),
  signupProgress: zod.object({
    accountCreated: zod.boolean().optional(),
    userId: zod.string().nullable().optional(),
    academicSaved: zod.boolean().optional(),
    researchSaved: zod.boolean().optional(),
  }).optional(),
  form: zod.object({
    fullName: zod.string(),
    email: zod.string(),
    role: zod.enum(SIGNUP_ROLES).optional(),
    institution: zod.string(),
    position: zod.string(),
    bio: zod.string(),
    interests: zod.array(zod.string()),
    researchFocus: zod.string(),
  }),
});

function readSignupDraft(navigationRole) {
  try {
    // Load the draft from this tab; no saved draft means a clean start.
    const savedDraft = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    const storedRole = sessionStorage.getItem(ONBOARDING_ROLE_KEY);
    const requestedRole =
      navigationRole ??
      (SIGNUP_ROLES.includes(storedRole) ? storedRole : null);
    if (!savedDraft) {
      return {
        step: 2,
        role: requestedRole ?? "researcher",
        form: emptyForm,
        signupProgress: {
          accountCreated: false,
          userId: null,
          academicSaved: false,
          researchSaved: false,
        },
        notice: "",
      };
    }

    // Parse and validate the stored JSON before restoring it into React state.
    const result = signupDraftSchema.safeParse(JSON.parse(savedDraft));
    if (!result.success) {
      // Remove invalid or outdated data so it does not break future attempts.
      sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
      return {
        step: 2,
        role: requestedRole ?? "researcher",
        form: emptyForm,
        signupProgress: {
          accountCreated: false,
          userId: null,
          academicSaved: false,
          researchSaved: false,
        },
        notice: "Your saved signup draft could not be restored. Please start again.",
      };
    }

    // Restore the last step and fields; the password is deliberately not stored.
    return {
      step: result.data.step,
      role: result.data.signupProgress?.accountCreated
        ? result.data.role ?? requestedRole ?? "researcher"
        : requestedRole ?? result.data.role ?? "researcher",
      form: { ...emptyForm, ...result.data.form },
      signupProgress: {
        accountCreated: result.data.signupProgress?.accountCreated ?? false,
        userId: result.data.signupProgress?.userId ?? null,
        academicSaved: result.data.signupProgress?.academicSaved ?? false,
        researchSaved: result.data.signupProgress?.researchSaved ?? false,
      },
      notice: result.data.signupProgress?.accountCreated
        ? "Your onboarding progress was restored."
        : "Your progress was restored. For your security, passwords aren't saved; re-enter and confirm yours on step 2 before submitting.",
    };
  } catch {
    // Storage may be unavailable or contain malformed JSON; recover with a clean form.
    return {
      step: 2,
      role: navigationRole ?? "researcher",
      form: emptyForm,
      signupProgress: {
        accountCreated: false,
        userId: null,
        academicSaved: false,
        researchSaved: false,
      },
      notice: "Your signup progress could not be read from this browser session.",
    };
  }
}

function validateAccountStep(form) {
  // Match account validation to the fields accepted by SignupDto.
  return zod.object({
    fullName: zod.string().min(1, "Full Name is required"),
    email: zod.string().email("Invalid email address"),
    role: zod.enum(SIGNUP_ROLES),
    password: zod.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: zod.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }).safeParse(form);
}

function validateAcademicStep(form) {
  // Match required values to AcademicStepDto.
  return zod.object({
    position: zod.string().min(1, "Field of study is required"),
    institution: zod.string().min(1, "Institution is required"),
    bio: zod.string().min(1, "Bio is required"),
  }).safeParse(form);
}

function validateResearchStep(form) {
  // Match required values to ResearchStepDto.
  return zod.object({
    interests: zod.array(zod.string().min(1, "Interest is required")).min(1, "At least one interest is required"),
    researchFocus: zod.string().min(1, "Research focus is required"),
  }).safeParse(form);
}

function getRequestErrorMessage(error, fallback) {
  // Nest may return one validation message or an array of messages.
  const message = error.response?.data?.message ?? error.response?.data?.error;
  return Array.isArray(message) ? message.join(" ") : message || error.message || fallback;
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
  const location = useLocation();
  const requestedRole = SIGNUP_ROLES.includes(location.state?.role)
    ? location.state.role
    : null;
  // Read the browser draft once so refreshes restore both the active step and form.
  const [initialDraft] = useState(() => readSignupDraft(requestedRole));
  const role = initialDraft.role;
  const finalStep = role === "student" ? 3 : LAST_STEP;
  const steps =
    role === "researcher"
      ? ["Account Type", "Basic Info", "Interests", "Profile Details"]
      : undefined;
  const [step, setStep] = useState(Math.min(initialDraft.step, finalStep));
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftNotice] = useState(initialDraft.notice);
  const [draftError, setDraftError] = useState("");
  const [form, setForm] = useState(() => ({
    ...initialDraft.form,
    role: initialDraft.role,
  }));
  const [signupProgress, setSignupProgress] = useState(initialDraft.signupProgress);

  // Store only non-sensitive fields so progress survives a refresh without saving a password.
  const saveDraft = (nextStep, nextForm, nextSignupProgress = signupProgress) => {
    const savedForm = {
      fullName: nextForm.fullName,
      email: nextForm.email,
      role: nextForm.role,
      institution: nextForm.institution,
      position: nextForm.position,
      bio: nextForm.bio,
      interests: nextForm.interests,
      researchFocus: nextForm.researchFocus,
    };
    try {
      sessionStorage.setItem(
        SIGNUP_DRAFT_KEY,
        JSON.stringify({
          step: nextStep,
          role: nextForm.role,
          form: savedForm,
          signupProgress: nextSignupProgress,
        })
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
    const updatedProgress =
      ["institution", "position", "bio"].includes(field)
        ? { ...signupProgress, academicSaved: false }
        : field === "interests" || field === "researchFocus"
          ? { ...signupProgress, researchSaved: false }
          : signupProgress;
    if (updatedProgress !== signupProgress) setSignupProgress(updatedProgress);
    saveDraft(step, updatedForm, updatedProgress);
    setSignupError("");
  };

  // Move to the previous step and save that step so refresh returns to the same place.
  const goBack = () => {
    const previousStep = step - 1;
    setStep(previousStep);
    saveDraft(previousStep, form);
  };

  // Save account data and researcher interests before moving forward.
  const goNext = async () => {
    const validation = step === 2 && !signupProgress.accountCreated
      ? validateAccountStep(form)
      : step === 3 && role === "researcher"
        ? validateResearchStep(form)
        : null;
    if (validation && !validation.success) {
      setSignupError(validation.error.issues[0]?.message ?? "Please check your information.");
      return;
    }

    setIsSubmitting(true);
    setSignupError("");
    try {
      let progress = signupProgress;

      if (step === 2 && !progress.accountCreated) {
        // Create the account with the selected role and account credentials.
        const signupResult = await signUpUser({
          fullName: form.fullName,
          role: form.role,
          email: form.email,
          password: form.password,
        });
        const userId = signupResult?.data?.userId;
        if (typeof userId !== "string" || !userId) {
          throw new Error("Signup did not return data.userId, so onboarding cannot continue.");
        }

        progress = {
          accountCreated: true,
          userId,
          academicSaved: false,
          researchSaved: false,
        };
        setSignupProgress(progress);
        setForm((currentForm) => ({
          ...currentForm,
          password: "",
          confirmPassword: "",
        }));
      }

      if (step === 3 && role === "researcher" && !progress.accountCreated) {
        throw new Error("Create your account before saving research details.");
      }

      if (step === 3 && role === "researcher" && !progress.researchSaved) {
        // Researchers must save interests before academic profile details.
        await saveResearchStep(progress.userId, {
          areaOfInterest: form.interests,
          briefResearchFocus: form.researchFocus,
        });
        progress = { ...progress, researchSaved: true };
        setSignupProgress(progress);
      }

      const nextStep = Math.min(step + 1, finalStep);
      setStep(nextStep);
      saveDraft(nextStep, form, progress);
    } catch (error) {
      // Keep the current step open so the user can retry a failed API request.
      setSignupError(getRequestErrorMessage(error, "Unable to save this signup step."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save academic profile data after researcher interests, then finish signup.
  const handleComplete = async () => {
    const isStudent = role === "student";
    const validation = validateAcademicStep(form);
    if (!validation.success) {
      setSignupError(
        validation.error.issues[0]?.message ??
          "Please check your profile details."
      );
      return;
    }
    if (!signupProgress.accountCreated) {
      setSignupError("Create your account before completing onboarding.");
      return;
    }

    if (!isStudent && !signupProgress.researchSaved) {
      setSignupError("Save your research interests before completing your profile.");
      return;
    }

    setIsSubmitting(true);
    setSignupError("");
    try {
      if (!signupProgress.academicSaved) {
        await saveAcademicStep(signupProgress.userId, {
          fieldOfStudy: form.position,
          institution: form.institution,
          bio: form.bio,
        });
        const progress = { ...signupProgress, academicSaved: true };
        setSignupProgress(progress);
        saveDraft(step, form, progress);
      }

      setSubmitted(true);
      try {
        // Clear the draft only after all account and onboarding requests succeed.
        sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
        sessionStorage.removeItem(ONBOARDING_ROLE_KEY);
      } catch {
        setDraftError("Your account was created, but the saved signup draft could not be cleared.");
      }
    } catch (error) {
      setSignupError(
        getRequestErrorMessage(error, "Unable to save your profile details.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the confirmation only after the signup API call succeeds.
  if (submitted) {
    return (
      <AuthShell currentStep={finalStep} totalSteps={finalStep} steps={steps}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 text-5xl">🎉</span>
          <p className="font-serif text-3xl font-bold text-slate-900">
            Welcome to ResearchHub, {role === "student" ? "student" : "researcher"}!
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
          <PrimaryButton to="/login" className="mt-8">
            Go to Login
          </PrimaryButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell currentStep={step} totalSteps={finalStep} steps={steps}>
      {/* Show only the fields belonging to the current step. */}
      <StepTransition stepKey={step}>
        {step === 2 && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Basic Information
            </p>
            <p className="mb-6 text-slate-500">
              {role === "student"
                ? "Create your student account"
                : "Create your researcher account"}
            </p>
            <FormField
              label="Full Name *"
              value={form.fullName}
              onChange={update("fullName")}
              disabled={signupProgress.accountCreated}
              placeholder="Jane Smith"
            />
            <FormField
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={update("email")}
              disabled={signupProgress.accountCreated}
              placeholder="jane.smith@university.edu"
            />
            <FormField
              label="Password *"
              type="password"
              value={form.password}
              onChange={update("password")}
              disabled={signupProgress.accountCreated}
              placeholder="Create a strong password"
            />
            <FormField
              label="Confirm Password *"
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              disabled={signupProgress.accountCreated}
              placeholder="Re-enter your password"
            />
          </>
        )}

        {step === 3 && role === "student" && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Profile Details
            </p>
            <p className="mb-6 text-slate-500">
              {role === "student"
                ? "Tell us about your studies and background"
                : "Tell us about your academic profile"}
            </p>
            <FormField
              label="Institution *"
              value={form.institution}
              onChange={update("institution")}
              placeholder="University of Lagos"
            />
            <FormField
              label="Field of Study *"
              value={form.position}
              onChange={update("position")}
              placeholder="Computer Science"
            />
            <FormField
              label="Short Bio *"
              textarea
              value={form.bio}
              onChange={update("bio")}
              placeholder="A sentence or two about your background..."
            />
          </>
        )}

        {step === 3 && role === "researcher" && (
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
                const progress = { ...signupProgress, researchSaved: false };
                setSignupProgress(progress);
                saveDraft(step, updatedForm, progress);
                setSignupError("");
              }}
              placeholder="Type and press Enter..."
            />
            <FormField
              label="Brief Research Focus *"
              textarea
              value={form.researchFocus}
              onChange={update("researchFocus")}
              placeholder="In 1-2 sentences, describe your research focus or interests..."
            />
          </>
        )}

        {step === 4 && role === "researcher" && (
          <>
            <p className="font-serif text-2xl font-bold text-slate-900">
              Profile Details
            </p>
            <p className="mb-6 text-slate-500">
              Tell us about your academic profile
            </p>
            <FormField
              label="Institution *"
              value={form.institution}
              onChange={update("institution")}
              placeholder="University of Lagos"
            />
            <FormField
              label="Field of Study *"
              value={form.position}
              onChange={update("position")}
              placeholder="Computer Science"
            />
            <FormField
              label="Short Bio *"
              textarea
              value={form.bio}
              onChange={update("bio")}
              placeholder="A sentence or two about your background..."
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
        {step < finalStep ? (
          <PrimaryButton className="flex-1" onClick={goNext} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue"}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            className="flex-1"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Completing signup..."
              : "Complete Signup"}
          </PrimaryButton>
        )}
      </div>
    </AuthShell>
  );
}

export default Signup;
