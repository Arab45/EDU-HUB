import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PostCard from "../components/PostCard";
import { PrimaryButton } from "../components/PrimaryButton";
import FollowButton from "../components/FollowButton";

const MOCK_POSTS = [
  {
    id: 1,
    author: "Jane Smith",
    authorInitials: "JS",
    institution: "University of Lagos",
    date: "Sep 20, 2026",
    title: "New findings on soil microbiome diversity",
    body: "We just wrapped up three months of fieldwork sampling soil across the delta region. Early results suggest microbial diversity is far richer than expected in previously unlogged sites.",
    image: "https://picsum.photos/seed/soil-research/800/450",
    likes: 24,
    comments: [
      {
        author: "David Okoye",
        text: "This is fantastic work, would love to see the raw dataset.",
      },
    ],
  },
  {
    id: 2,
    author: "Amara Chukwu",
    authorInitials: "AC",
    institution: "Covenant University",
    date: "Sep 18, 2026",
    title: "Presenting at the West Africa Climate Symposium",
    body: "Excited to share our team's work on rainfall pattern modeling next month. Slides and a preprint will follow soon.",
    image: "https://picsum.photos/seed/climate-symposium/800/450",
    likes: 41,
    comments: [],
  },
  {
    id: 3,
    author: "David Okoye",
    authorInitials: "DO",
    institution: "University of Ibadan",
    date: "Sep 15, 2026",
    title: "Tagging reef fish off the Lagos coastline",
    body: "Spent the week tagging juvenile reef fish to track migration patterns as water temperatures shift. Here's a look at the crew in action.",
    image: "https://picsum.photos/seed/reef-fieldwork/800/450",
    likes: 63,
    comments: [
      {
        author: "Jane Smith",
        text: "Incredible shots, how many species did you tag in total?",
      },
      {
        author: "Amara Chukwu",
        text: "Following this closely, keep the updates coming!",
      },
    ],
  },
  {
    id: 4,
    author: "Ngozi Eze",
    authorInitials: "NE",
    institution: "Obafemi Awolowo University",
    date: "Sep 12, 2026",
    title: "Preprint out: machine learning for crop yield prediction",
    body: "Our preprint on using satellite imagery and ML to predict cassava yield across smallholder farms just went live. Feedback welcome.",
    image: "https://picsum.photos/seed/crop-ml/800/450",
    likes: 37,
    comments: [],
  },
];

const SUGGESTED_RESEARCHERS = [
  { id: 1, name: "Ngozi Eze", institution: "Obafemi Awolowo University", initials: "NE" },
  { id: 2, name: "Tunde Bakare", institution: "University of Ibadan", initials: "TB" },
  { id: 3, name: "Chidinma Obi", institution: "University of Nigeria", initials: "CO" },
];

function Home() {
  return (
    <AppShell maxWidth="max-w-6xl">
      <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-6 text-white">
        <p className="font-serif text-2xl font-bold">Welcome back, Jane</p>
        <p className="mt-1 text-white/80">
          Here's what's new from the researchers you follow
        </p>
        <PrimaryButton to="/new-post" variant="accent" className="mt-4">
          Share an update
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 font-serif text-base font-bold text-slate-900">
              Researchers to follow
            </p>
            <div className="flex flex-col gap-3">
              {SUGGESTED_RESEARCHERS.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link to="/profile" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {r.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.institution}
                      </p>
                    </div>
                  </Link>
                  <FollowButton size="sm" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

export default Home;
