
function AuthShell({ currentStep, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3ECDC] p-6">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] shadow-xl md:min-h-[640px] md:flex-row">
        <div className="flex w-full flex-col justify-between gap-10 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-10 text-white md:w-2/5">
          <div>
            <p className="font-serif text-3xl font-bold">ResearchHub</p>
            <p className="mt-4 text-white/80">
              Connect with brilliant minds. Collaborate on groundbreaking
              research. Shape the future of discovery.
            </p>
          </div>

          {currentStep && <Stepper currentStep={currentStep} />}
        </div>

        <div className="flex w-full flex-1 flex-col justify-center bg-white p-8 sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
