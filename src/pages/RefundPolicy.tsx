import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const RefundPolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Refund Policy"
        description="Understand VibeLink Event's refund policy for digital invitation orders, including full and partial refund conditions."
        canonical="/refund-policy"
        noindex={true}
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: 4 August 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Deposit Refund Before Design Begins</h2>
            <p className="text-muted-foreground">
              You are entitled to a <strong>full refund of your deposit</strong> if you
              cancel your order before we begin any design work. This typically means
              within 24 hours of placing your order, provided no designer has been
              assigned to your project. This is the money-back promise we make on the
              pricing and order pages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Once Design Work Has Begun</h2>
            <p className="text-muted-foreground">
              After we assign a designer and begin work on your invitation, the
              deposit becomes non-refundable. The deposit covers the design time
              already invested in your project.
            </p>
            <p className="text-muted-foreground mt-4">
              If you need to change event details (date, venue, colours, etc.) after
              work has started, your included revision rounds cover those updates at
              no extra cost.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. No Refund</h2>
            <p className="text-muted-foreground mb-4">
              For clarity, refunds are not available in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>After design work has begun (see §2 above)</li>
              <li>After final design approval has been given</li>
              <li>After the invitation has been published / gone live</li>
              <li>For add-on services that have been delivered</li>
              <li>For rush delivery fees after work has begun</li>
              <li>For hosting fees after the invitation has been published</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Event Cancellation</h2>
            <p className="text-muted-foreground">
              We understand that events may be cancelled due to unforeseen
              circumstances. Where design work has already begun, we cannot refund
              the deposit but we will issue a <strong>credit note valid for 12 months</strong>
              that you can apply to any future VibeLink invitation of equal or
              greater value.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. How to Request a Refund</h2>
            <p className="text-muted-foreground mb-4">
              To request a refund, please contact us with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your order confirmation number</li>
              <li>The reason for your refund request</li>
              <li>Your preferred refund method (original payment method or Mobile Money)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Refund requests are processed within 3-5 business days. The funds may take an additional 5-10 business days to appear in your account depending on your payment provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              If you're not satisfied with our refund decision, please contact our customer service team. We're committed to finding a fair resolution for all parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For refund requests or questions:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Email:</strong> refunds@vibelinkevent.com</li>
              <li><strong>WhatsApp:</strong> +49 157 5717 8561</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
