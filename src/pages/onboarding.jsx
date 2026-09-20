import { Link } from "react-router-dom";
import { GiArchiveResearch } from "react-icons/gi";
import { FcGraduationCap } from "react-icons/fc";
import Stepper from "../components/stepper";

function RoleCard({ icon, title, description }) {
  return (
    <div className="flex flex-col border rounded border-slate-400 p-4 h-44 items-center justify-center cursor-pointer transition-colors duration-300 ease-in-out hover:bg-slate-200 hover:border-orange-400">
      {icon}
      <p className="font-semibold">{title}</p>
      <p>{description}</p>
    </div>
  );
}

function Onboarding() {
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

        <Stepper currentStep={1} />
      </div>

      <div className="flex w-1/2 bg-slate-50 h-screen text-black p-4 justify-center">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col items-center justify-center">
            <p className="font-bold text-xl text-black mx-4">Join as a...</p>
            <p>Select the role that best describes you</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <RoleCard
              icon={
                <GiArchiveResearch className="text-3xl mx-auto text-slate-900" />
              }
              title="Researcher"
              description="Share your work, find collaborators"
            />
            <RoleCard
              icon={
                <FcGraduationCap className="text-3xl mx-auto text-slate-900" />
              }
              title="Student"
              description="Explore projects, gain experience"
            />
          </div>

          <Link
            to="/login"
            className="flex flex-col items-center justify-center bg-slate-900 text-white p-4 rounded-2xl font-bold cursor-pointer transition-colors duration-300 ease-in-out hover:bg-orange-500"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
