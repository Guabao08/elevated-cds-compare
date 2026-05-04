import { Link } from "react-router-dom";
import { Search, GitCompare, Sparkles, TrendingUp, DollarSign, Users, Award } from "lucide-react";

const STATS = [
  { label: "Schools in database", value: "6,000+", icon: Award },
  { label: "Data points per school", value: "20+", icon: TrendingUp },
  { label: "Tuition data tracked", value: "$0–$80K", icon: DollarSign },
  { label: "Students supported", value: "Free", icon: Users },
];

const FEATURES = [
  {
    icon: Search,
    title: "Smart School Search",
    desc: "Filter by acceptance rate, tuition, location, size, and more. Find schools that actually fit your profile.",
    to: "/search",
    cta: "Explore Schools",
    bg: "bg-green-50",
    iconBg: "bg-green-900",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Comparison",
    desc: "Compare up to 3 schools across every metric — tuition, outcomes, admissions stats, and student life.",
    to: "/compare",
    cta: "Start Comparing",
    bg: "bg-orange-pale",
    iconBg: "bg-orange",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    desc: "Tell us your GPA, test scores, budget, and goals. Our AI builds a personalized Reach/Target/Safety list.",
    to: "/recommend",
    cta: "Get My List",
    bg: "bg-cream-dark",
    iconBg: "bg-green-700",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-300 rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-green-200 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              Powered by College Scorecard data
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
              Find Your{" "}
              <span className="text-orange">Perfect</span>
              <br />College Match
            </h1>
            <p className="text-lg md:text-xl text-green-200 mb-8 max-w-xl leading-relaxed">
              Search 6,000+ schools, compare side-by-side, and get an AI-powered
              Reach/Target/Safety list tailored to your profile.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/search" className="btn-primary text-base px-6 py-3">
                <Search size={18} />
                Explore Schools
              </Link>
              <Link to="/recommend" className="inline-flex items-center gap-2 bg-white text-green-900 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-base">
                <Sparkles size={18} />
                Get Recommendations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-cream-dark border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-900 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-green-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-900 mb-3">
            Everything You Need to Decide
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From first search to final decision, we've got the data and tools you need.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, to, cta, bg, iconBg }) => (
            <div key={title} className={`card p-6 ${bg}`}>
              <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{desc}</p>
              <Link to={to} className="btn-primary text-sm">
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Ready to Find Your School?</h2>
          <p className="text-green-300 mb-8 text-lg">
            It takes less than 2 minutes to get a personalized college list.
          </p>
          <Link to="/recommend" className="inline-flex items-center gap-2 bg-orange text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-orange-dark transition-colors">
            <Sparkles size={20} />
            Get My Free Recommendations
          </Link>
        </div>
      </section>
    </div>
  );
}
