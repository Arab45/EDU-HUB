import Stepper from "./stepper";

function AuthShell({ currentStep, children }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <div className="flex w-full flex-col justify-between gap-10 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-10 text-white md:w-2/5 md:p-14">
        <div>
          <p className="font-serif text-3xl font-bold">ResearchHub</p>
          <p className="mt-4 text-white/80">
            Connect with brilliant minds. Collaborate on groundbreaking
            research. Shape the future of discovery.
          </p>
        </div>

        {currentStep && <Stepper currentStep={currentStep} />}
      </div>

      <div className="flex w-full flex-1 flex-col justify-center bg-white p-8 sm:p-12 md:w-3/5 md:p-16">
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
