import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import { portfolioItems, categories, slugToCategoryMap } from "@/data/portfolioItems";

const categoryStyles: Record<string, { active: string; inactive: string; dot: string }> = {
  All:           { active: "bg-[#6B46C1] text-white",         inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100",    dot: "bg-purple-400" },
  Weddings:      { active: "bg-rose-500 text-white",           inactive: "bg-rose-50 text-rose-600 hover:bg-rose-100",          dot: "bg-rose-400" },
  Funerals:      { active: "bg-slate-700 text-white",          inactive: "bg-slate-100 text-slate-600 hover:bg-slate-200",      dot: "bg-slate-400" },
  Naming:        { active: "bg-sky-500 text-white",            inactive: "bg-sky-50 text-sky-600 hover:bg-sky-100",             dot: "bg-sky-400" },
  Anniversaries: { active: "bg-amber-500 text-white",          inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100",       dot: "bg-amber-400" },
  Graduations:   { active: "bg-emerald-600 text-white",        inactive: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", dot: "bg-emerald-400" },
  Church:        { active: "bg-violet-600 text-white",          inactive: "bg-violet-50 text-violet-700 hover:bg-violet-100",    dot: "bg-violet-400" },
  Birthdays:     { active: "bg-pink-500 text-white",           inactive: "bg-pink-50 text-pink-600 hover:bg-pink-100",          dot: "bg-pink-400" },
  Corporate:     { active: "bg-blue-700 text-white",           inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100",          dot: "bg-blue-500" },
  Other:         { active: "bg-gray-600 text-white",           inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200",         dot: "bg-gray-400" },
};

const Portfolio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  
  const initialCategory = typeParam ? (slugToCategoryMap[typeParam] || "All") : "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    if (typeParam) {
      const mappedCategory = slugToCategoryMap[typeParam];
      if (mappedCategory) {
        setActiveCategory(mappedCategory);
      }
    }
  }, [typeParam]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      setSearchParams({});
    } else {
      const slug = Object.entries(slugToCategoryMap).find(([_, cat]) => cat === category)?.[0];
      if (slug) {
        setSearchParams({ type: slug });
      } else {
        setSearchParams({});
      }
    }
  };

  const filteredItems =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.type === activeCategory);

  return (
    <Layout>
      <SEO 
        title="Portfolio"
        description="Browse our portfolio of stunning digital invitations for weddings, funerals, naming ceremonies & more. See real examples of our work for Ghanaian events."
        keywords="digital invitation examples Ghana, wedding invitation samples, funeral program examples"
        canonical="/portfolio"
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Our Work
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Our Portfolio
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              See why families across the world choose VibeLink for their biggest moments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => {
              const style = categoryStyles[category] || categoryStyles.Other;
              const isActive = activeCategory === category;
              return (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.07, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                    isActive ? style.active : style.inactive
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : style.dot}`} />
                  {category}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {item.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {item.demoUrl ? (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant={item.demoLabel ? "default" : "gold"} size="sm" className="w-full">
                          {item.demoLabel || "View Live Demo"}
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Demo Coming Soon
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/portfolio/${item.slug}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection hideViewWork />
    </Layout>
  );
};

export default Portfolio;
