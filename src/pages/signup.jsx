import FormField from "../components/form";
import PrimaryButton from "../components/primaryButton";
import Stepper from "../components/stepper";

function Signup() {
  return (
    <div className="flex min-h-screen bg-background text-primary">
      <div className="flex flex-col justify-between w-1/2 h-screen p-4">
        {/* <img src={logo} alt="logo" className='sm:w-screen h-32'/> */}
        <div>
          <p className="font-bold sm:text-2xl p-2">
            EDUCATION DEVELOPMENT UNIT HUB
          </p>
          <div className="flex flex-col gap-2 p-2">
            <p>
              Connect with brilliant minds. Collaborate on groundbreaking
              research. Shape the future of discovery.
            </p>
          </div>
        </div>

        <Stepper currentStep={2} />
      </div>

      <div className="flex-1 bg-slate-50 h-screen text-black p-4 flex justify-center">
        <div className="flex flex-col gap-4 w-full mt-10 items-center">
          <div className="flex flex-col mx-4">
            <p className="font-bold text-xl">Basic Information</p>
            <p>Let's start with the essentials</p>
          </div>

          <div>
            <FormField label="Full Name *" placeholder="John Doe" />
            <FormField
              label="Email Address *"
              type="email"
              placeholder="johnDoe@gmail.com"
            />
            <FormField
              label="Phone Number *"
              type="tel"
              placeholder="123-456-7890"
            />
            <FormField
              label="Password *"
              type="password"
              placeholder="Create a strong password"
            />
            <PrimaryButton>Sign Up</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
