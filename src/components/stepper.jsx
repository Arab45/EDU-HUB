const STEPS = ["Account Type", "Basic Info", "Profile Details", "Interests"];

function Stepper({ currentStep }) {
  return (
    <div>
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        return (
          <div className="flex gap-4 mb-2" key={label}>
            <div
              className={`flex items-center justify-center h-6 w-6 rounded-full border-0 transition-colors duration-500 ease-in-out ${
                isActive
                  ? "bg-orange-400 ring-2 ring-orange-200"
                  : "bg-slate-400"
              }`}
            >
              {stepNumber}
            </div>
            <p>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
