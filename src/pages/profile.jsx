import AppShell from "../components/AppShell";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";

const MOCK_PROFILE = {
  name: "Jane Smith",
  initials: "JS",
  institution: "University of Lagos",
  field: "Environmental Microbiology",
  bio: "PhD candidate researching soil microbiome diversity across West African ecosystems. Always happy to talk fieldwork logistics.",
  followers: 128,
  following: 56,
};

const MOCK_POSTS = [
  {
    id: 1,
    author: "Jane Smith",
    authorInitials: "JS",
    institution: "University of Lagos",
    date: "Sep 20, 2026",
    title: "New findings on soil microbiome diversity",
    body: "We just wrapped up three months of fieldwork sampling soil across the delta region.",
    image: null,
    likes: 24,
    comments: [],
  },
];

function Profile() {
  return (
    <AppShell>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800">
              {MOCK_PROFILE.initials}
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-slate-900">
                {MOCK_PROFILE.name}
              </p>
              <p className="text-slate-500">{MOCK_PROFILE.institution}</p>
              <p className="text-sm text-emerald-700">{MOCK_PROFILE.field}</p>
            </div>
          </div>
          <FollowButton />
        </div>

        <p className="mt-4 text-slate-600">{MOCK_PROFILE.bio}</p>

        <div className="mt-4 flex gap-6 text-sm text-slate-500">
          <span>
            <span className="font-semibold text-slate-900">
              {MOCK_PROFILE.followers}
            </span>{" "}
            followers
          </span>
          <span>
            <span className="font-semibold text-slate-900">
              {MOCK_PROFILE.following}
            </span>{" "}
            following
          </span>
        </div>
      </div>

      <p className="mb-3 font-serif text-lg font-bold text-slate-900">
        Posts
      </p>
      {MOCK_POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppShell>
  );
}

export default Profile;
