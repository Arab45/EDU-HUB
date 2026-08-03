import logo from "../assets/logo/EDU.png";

function Signup() {
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
          <p className="font-bold text-xl text-slate-900 text-left mx-4 mb-4">
            Sign Up
          </p>
          <div className="">
            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Full Name
              </label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mx-4 font-semibold text-slate-900">Email</label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="johnDoe@gmail.com"
              />
            </div>

            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Phone Number
              </label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="123-456-7890"
              />
            </div>
            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Password
              </label>
              <br />
              <input
                className="border rounded p-1.5 w-2xs mx-4"
                placeholder="******"
              />
            </div>
            <button className="bg-background text-primary p-2 mx-4 mt-2 w-2xs border rounded font-semibold">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
