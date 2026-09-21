import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

function ResearcherCard({ researcher }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 ease-in-out hover:border-slate-300">
      <Link to="/profile" className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {researcher.initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{researcher.name}</p>
          <p className="text-sm text-slate-500">
            {researcher.institution} · {researcher.field}
          </p>
        </div>
      </Link>
      <FollowButton />
    </div>
  );
}

export default ResearcherCard;
