import FormField from "../components/form";
import PrimaryButton from "../components/primaryButton";

function Login() {
  return (
    <div className="flex min-h-screen bg-background text-primary">
      <div className="flex items-center justify-center w-1/2 h-screen">
        {/* <img src={logo} alt="logo" className='sm:w-screen h-32'/> */}
        <p className="font-bold sm:text-2xl p-2">
          EDUCATION DEVELOPMENT UNIT HUB
        </p>
      </div>

      <div className="flex w-1/2 bg-slate-50 h-screen text-black items-center justify-center">
        <div className="gap-4">
          <p className="font-bold text-xl text-slate-900 text-center">
            Login
          </p>
          <div>
            <FormField
              label="Email"
              type="email"
              placeholder="johnDoe@gmail.com"
            />
            <FormField label="Password" type="password" placeholder="******" />
            <PrimaryButton>Sign In</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
