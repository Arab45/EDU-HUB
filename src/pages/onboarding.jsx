import { Link } from "react-router-dom";
import logo from "../assets/logo/EDU.png";
import { FcGraduationCap } from "react-icons/fc";
import { GiArchiveResearch } from "react-icons/gi";

function Onboarding() {

    const handleSignupClick = () => {
        window.location.href = "/signup";
    }

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
                <div className="flex items-center justify-center h-6 w-6 bg-orange-400 rounded-full border-0">1</div>
                <p>Account Type</p>
            </div>
            <div className="flex gap-4 mb-2">
                <div className="flex items-center justify-center h-6 w-6 bg-slate-400 rounded-full border-0">2</div>
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
      <div className="flex w-1/2 bg-slate-50 h-screen text-black p-4 justify-center">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col items-center justify-center">
            <p className="font-bold text-xl text-black text-left mx-4">
              Join as a....
            </p>
            <p>Select the role that best describes you</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col border rounded border-slate-400 p-4 hover:bg-slate-200 h-44 items-center justify-center">
            <GiArchiveResearch className="text-3xl mx-auto text-slate-900" />
            <p className="font-semibold">Researcher</p>
            <p>Share your work, find collaborators</p>
          </div>
          <div className="flex flex-col border rounded border-slate-400 p-4 hover:bg-slate-200 h-44 items-center justify-center">
              <FcGraduationCap className="text-3xl mx-auto text-slate-900" />
            <p className="font-semibold">Student</p>
            <p>Explore projects, gain experience</p>
          </div>
        </div>
        <nav className="flex flex-col items-center justify-center bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-700 cursor-pointer">
            <Link to="/signup" className="font-bold">
              Continue
            </Link>
        </nav>
      </div>
      </div>
    </div>
  );
}

export default Onboarding;
