const STEPS = ["Account Type", "Basic Info", "Profile Details", "Interests"];

function Stepper({ currentStep }) {
  return (
    <div className="flex flex-col gap-3">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <div className="flex items-center gap-4" key={label}>
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500 ease-in-out ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : isComplete
                  ? "bg-white/25 text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {stepNumber}
            </div>
            <p
              className={`transition-colors duration-500 ease-in-out ${
                isActive ? "font-semibold text-white" : "text-white/50"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
