import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";
import StartChatButton from "./StartChatButton";

function ResearcherCard({
  researcher,
  currentUserId,
  isFollowing = false,
  onFollowingChange,
}) {
  const id = researcher._id ?? researcher.id ?? researcher.userId;
  const name =
    researcher.fullName ?? researcher.name ?? researcher.username ?? "Researcher";
  const institution =
    researcher.institution ??
    researcher.academic?.institution ??
    researcher.profile?.institution ??
    "";
  const field =
    researcher.field ??
    researcher.fieldOfStudy ??
    researcher.academic?.fieldOfStudy ??
    "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors duration-300 ease-in-out hover:border-slate-300 sm:gap-4 sm:p-4">
      <Link to={`/profile/${id}`} className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {researcher.initials ?? initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{name}</p>
          <p className="break-words text-sm text-slate-500">
            {[institution, field].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 gap-2">
        <FollowButton
          size="sm"
          currentUserId={currentUserId}
          targetId={id}
          isFollowing={isFollowing}
          onFollowingChange={onFollowingChange}
        />
        <StartChatButton
          currentUserId={currentUserId}
          user={{ id, name, institution }}
        />
      </div>
    </div>
  );
}

export default ResearcherCard;
