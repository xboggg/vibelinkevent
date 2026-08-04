import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
  // Article-specific OG properties (only used when ogType === "article")
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  // Auto-discovery for RSS feeds — set on the Blog page and article pages.
  rssUrl?: string;
  rssTitle?: string;
}

// Organization schema — used site-wide. We deliberately do NOT use
// LocalBusiness here: VibeLink is online-first with no physical office,
// so a PostalAddress + geo would be fabricated. Organization is the
// correct type; areaServed still communicates the Ghana + diaspora scope.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://vibelinkevent.com/#organization",
  name: "VibeLink Event",
  alternateName: "VibeLink",
  description: "Digital invitations for Ghanaian celebrations — weddings, funerals, naming ceremonies, graduations and corporate events, at home and across the diaspora.",
  url: "https://vibelinkevent.com",
  logo: "https://vibelinkevent.com/og-image.jpg",
  image: "https://vibelinkevent.com/og-image.jpg",
  email: "hello@vibelinkevent.com",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+4915757178561",
      contactType: "customer support",
      availableLanguage: ["English"],
      areaServed: ["GH", "Worldwide"],
    },
  ],
  areaServed: [
    { "@type": "Country", name: "Ghana" },
    { "@type": "Place", name: "Global (Ghanaian diaspora)" },
  ],
  sameAs: [
    "https://www.instagram.com/vibelinkevent",
    "https://www.facebook.com/vibelinkevent",
    "https://twitter.com/vibelinkevent",
    "https://www.tiktok.com/@vibelinkevent",
  ],
};

// Website schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://vibelinkevent.com/#website",
  url: "https://vibelinkevent.com",
  name: "VibeLink Event",
  description: "Digital invitations for Ghanaian celebrations, at home and across the diaspora.",
  publisher: {
    "@id": "https://vibelinkevent.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://vibelinkevent.com/portfolio?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const SEO = ({
  title = "VibeLink Event | Digital Event Invitations",
  description = "Digital invitations for Ghanaian celebrations. Create stunning interactive invitations for weddings, funerals, naming ceremonies, graduations and corporate events — at home and across the diaspora.",
  keywords = "digital invitations Ghana, wedding invitations Ghana, funeral programs Ghana, naming ceremony invitations, event invitations Accra",
  canonical,
  ogImage = "https://vibelinkevent.com/og-image.jpg",
  ogType = "website",
  noindex = false,
  jsonLd,
  articleAuthor,
  articleSection,
  articleTags,
  articlePublishedTime,
  articleModifiedTime,
  rssUrl,
  rssTitle,
}: SEOProps) => {
  const fullTitle = title.includes("VibeLink") ? title : `${title} | VibeLink Event`;
  const siteUrl = "https://vibelinkevent.com";
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  // Combine base schemas with page-specific schemas
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {rssUrl && (
        <link
          rel="alternate"
          type="application/rss+xml"
          title={rssTitle || "VibeLink Event Blog"}
          href={rssUrl}
        />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="VibeLink Event" />
      <meta property="og:locale" content="en_GH" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Article-specific OG (Facebook, LinkedIn use these for richer previews) */}
      {ogType === "article" && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {ogType === "article" && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {ogType === "article" && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === "article" && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === "article" &&
        articleTags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vibelinkevent" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      {ogType === "article" && articleAuthor && (
        <meta name="twitter:label1" content="Written by" />
      )}
      {ogType === "article" && articleAuthor && (
        <meta name="twitter:data1" content={articleAuthor} />
      )}
      {ogType === "article" && articleSection && (
        <meta name="twitter:label2" content="Category" />
      )}
      {ogType === "article" && articleSection && (
        <meta name="twitter:data2" content={articleSection} />
      )}
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(allSchemas)}
      </script>
    </Helmet>
  );
};

export default SEO;

// Helper schemas for specific page types
export const createServiceSchema = (services: Array<{ name: string; description: string; price?: string }>) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  provider: {
    "@id": "https://vibelinkevent.com/#organization",
  },
  areaServed: {
    "@type": "Country",
    name: "Ghana",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Invitation Services",
    itemListElement: services.map((service, index) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
      },
      price: service.price,
      priceCurrency: "GHS",
      position: index + 1,
    })),
  },
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `https://vibelinkevent.com${item.url}`,
  })),
});

// Rich BlogPosting schema — helps Google's rich results for articles.
// Includes explicit Person author (Edmund), articleSection, keywords, and
// optional partOf for series posts.
export const createArticleSchema = (article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  authorRole?: string;
  image?: string;
  url: string;
  category?: string;
  tags?: string[];
  wordCount?: number;
  seriesTitle?: string;
  seriesUrl?: string;
}) => {
  const absoluteImage = article.image
    ? (article.image.startsWith("http") ? article.image : `https://vibelinkevent.com${article.image.startsWith("/") ? "" : "/"}${article.image}`)
    : "https://vibelinkevent.com/og-image.jpg";
  const absoluteUrl = `https://vibelinkevent.com${article.url.startsWith("/") ? "" : "/"}${article.url}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author || "Edmund Adjekum",
      jobTitle: article.authorRole || "Founder & Lead Viber",
      url: "https://vibelinkevent.com/about",
      image: "https://luuztlneysofymmuoxie.supabase.co/storage/v1/object/public/team-photos/4a4c13d6-ae68-4c1a-8346-e8b8228c5c10.jpg",
      worksFor: {
        "@type": "Organization",
        name: "VibeLink Event",
        url: "https://vibelinkevent.com",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "VibeLink Event",
      url: "https://vibelinkevent.com",
      logo: {
        "@type": "ImageObject",
        url: "https://vibelinkevent.com/vibelink-logo.png",
      },
    },
    image: {
      "@type": "ImageObject",
      url: absoluteImage,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl,
    },
    url: absoluteUrl,
  };

  if (article.category) schema.articleSection = article.category;
  if (article.tags && article.tags.length > 0) schema.keywords = article.tags.join(", ");
  if (article.wordCount) schema.wordCount = article.wordCount;
  if (article.seriesTitle && article.seriesUrl) {
    schema.isPartOf = {
      "@type": "CreativeWorkSeries",
      name: article.seriesTitle,
      url: `https://vibelinkevent.com${article.seriesUrl}`,
    };
  }

  return schema;
};
