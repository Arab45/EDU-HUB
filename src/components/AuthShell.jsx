import Stepper from "./stepper";

function AuthShell({ currentStep, children }) {
  return (
    <div className="academic-page-background flex min-h-screen w-full flex-col md:flex-row">
      <div
        className="relative isolate flex min-h-[280px] w-full flex-col justify-between gap-10 overflow-hidden bg-emerald-950/45 p-8 text-white sm:p-10 md:min-h-screen md:w-2/5 md:p-14"
      >
        <div className="relative z-10">
          <p className="font-serif text-3xl font-bold">ResearchHub</p>
          <p className="mt-4 max-w-md text-white/90">
            Connect with brilliant minds. Collaborate on groundbreaking
            research. Shape the future of discovery.
          </p>
        </div>

        {currentStep && (
          <div className="relative z-10">
            <Stepper currentStep={currentStep} />
          </div>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col justify-center bg-white/90 p-8 backdrop-blur-sm sm:p-12 md:w-3/5 md:p-16">
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
