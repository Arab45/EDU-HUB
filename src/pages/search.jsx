import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import AppShell from "../components/AppShell";
import ResearcherCard from "../components/ResearcherCard";

const MOCK_RESEARCHERS = [
  {
    id: 1,
    name: "Jane Smith",
    institution: "University of Lagos",
    field: "Environmental Microbiology",
    initials: "JS",
  },
  {
    id: 2,
    name: "Amara Chukwu",
    institution: "Covenant University",
    field: "Climate Science",
    initials: "AC",
  },
  {
    id: 3,
    name: "David Okoye",
    institution: "University of Ibadan",
    field: "Marine Biology",
    initials: "DO",
  },
];

function Search() {
  const [query, setQuery] = useState("");

  const results = MOCK_RESEARCHERS.filter((r) =>
    `${r.name} ${r.institution} ${r.field}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <p className="mb-1 font-serif text-2xl font-bold text-slate-900">
        Search
      </p>
      <p className="mb-6 text-slate-500">
        Find researchers by name, institution, or field
      </p>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors duration-300 ease-in-out focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <FiSearch className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, institution, or keyword..."
          className="flex-1 border-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {results.length === 0 ? (
        <p className="text-slate-500">No researchers found.</p>
      ) : (
        results.map((r) => <ResearcherCard key={r.id} researcher={r} />)
      )}
    </AppShell>
  );
}

export default Search;
