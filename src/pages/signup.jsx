import logo from "../assets/logo/EDU.png";

function Signup() {
  return (
    <div className="flex min-h-screen bg-background text-primary">
      <div className="flex flex-col justify-between w-1/2 h-screen p-4">
        {/* <img src={logo} alt="logo" className='sm:w-screen h-32'/> */}
        <div className="">
        <p className="font-bold sm:text-2xl p-2">
          EDUCATION DEVELOPMENT UNIT HUB
        </p>
        <div className="flex flex-col gap-2 p-2">
          <p>Connect with brilliant minds. Collarate on groundbreaking research. Shape the future of discovery.</p>
        </div>
        </div>

        <div>
            <div className="flex gap-4 mb-2">
                <div className="flex items-center justify-center h-6 w-6 bg-slate-400 rounded-full border-0">1</div>
                <p>Account Type</p>
            </div>
            <div className="flex gap-4 mb-2">
                <div className="flex items-center justify-center h-6 w-6 bg-orange-400  rounded-full border-0">2</div>
                <p>Basic Info</p>
            </div>
            <div className="flex gap-4 mb-2">
                <div className="flex items-center justify-center h-6 w-6 bg-slate-400 rounded-full border-0">3</div>
                <p>Profile Details</p>
            </div>

            <div className="flex gap-4 mb-2">
                <div className="flex items-center justify-center h-6 w-6 bg-slate-400 rounded-full border-0">4</div>
                <p>Interests</p>
            </div>
        </div>
      </div>
      <div className="flex flex-1 bg-slate-50 h-screen text-black p-4 justify-center">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col mx-4">
          <p className="font-bold text-xl">
            Basic Information
          </p>
          <p className="">let's start with the essential</p>
          </div>
          <div className="">
            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Full Name *
              </label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mx-4 font-semibold text-slate-900">Email Address *</label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="johnDoe@gmail.com"
              />
            </div>

            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Phone Number *
              </label>
              <br />
              <input
                className="border rounded p-1.5 mb-2 w-2xs mx-4"
                placeholder="123-456-7890"
              />
            </div>
            <div>
              <label className="mx-4 font-semibold text-slate-900">
                Password *  
              </label>
              <br />
              <input
                className="border rounded p-1.5 w-2xs mx-4"
                placeholder="Create a strong password"
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
