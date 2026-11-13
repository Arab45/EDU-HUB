import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

function ResearcherCard({ researcher }) {
  return (
    <div className="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors duration-300 ease-in-out hover:border-slate-300 sm:gap-4 sm:p-4">
      <Link to="/profile" className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {researcher.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{researcher.name}</p>
          <p className="break-words text-sm text-slate-500">
            {researcher.institution} · {researcher.field}
          </p>
        </div>
      </Link>
      <FollowButton />
    </div>
  );
}

export default ResearcherCard;
