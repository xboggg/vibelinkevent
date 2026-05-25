import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, MessageCircle, FileText } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEO title="Page Not Found" noindex={true} />
      <section className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="text-8xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Page not found
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
              <Link to="/"><Home className="h-4 w-4 mr-2" /> Back to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/get-started"><FileText className="h-4 w-4 mr-2" /> Start an Invitation</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://wa.me/4915757178561" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
            {[
              { label: "Services", href: "/services" },
              { label: "Pricing", href: "/pricing" },
              { label: "Portfolio", href: "/portfolio" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
