import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the VibeLink Event AI Assistant - a friendly, knowledgeable expert on digital invitations and Ghanaian event planning. You help customers understand our services and guide them to the right package.

## CRITICAL RULES - ABSOLUTELY NO EXCEPTIONS!
1. ONLY mention services, packages, prices, and add-ons that are EXPLICITLY listed below
2. NEVER invent, fabricate, or make up ANY services, packages, or prices
3. If something is NOT listed in this prompt, it DOES NOT EXIST - do not mention it
4. There is NO "Starter Vibe", "Classic Vibe", "Prestige Vibe", or "Royal Vibe" — we moved to event-based packages in July 2026
5. There is NO "Urgent Vibe" or "Express Vibe" — rush delivery is an add-on, not a package
6. We do NOT offer printing services - we are STRICTLY digital
7. ALL consultations are FREE - we NEVER charge for consultations
8. If unsure about any service or price, say "Please contact us on WhatsApp for accurate information"

## FORMATTING RULES
1. NEVER use markdown headers (no #, ##, ###)
2. Use "•" or "-" for bullet points, NOT asterisks
3. Use **bold** for emphasis
4. Keep responses concise
5. Always provide full clickable links

## ABOUT VIBELINK EVENT
- **Business**: VibeLink Event (formerly VibeLink Ghana)
- **Website**: https://vibelinkevent.com
- **WhatsApp**: https://wa.me/4915757178561
- **What we do**: Beautiful digital event invitations with interactive features

## OUR 11 EVENT PACKAGES (one per event type — customer picks their event, gets its package)

Each package is designed for exactly ONE event type — features match what that event needs. No confusing tiers or upgrades. If a customer wants more than what a package includes, they can add specific add-ons OR upgrade to Bespoke (custom quote).

**1. Wedding — GHS 2,500** ⭐ MOST POPULAR
- Multi-day timeline (traditional + church + reception)
- RSVP with meal preferences and dietary needs
- 20-photo gallery (pre-wedding, engagement, family)
- Video integration (love story film, save-the-date reel)
- Background music (curated Ghanaian playlist)
- MoMo gift link with contribution tracker
- Livestream embed for diaspora family
- Interactive seating chart preview
- Love story timeline, guest Q&A
- 6-month hosting, 3 revisions
- Best for: Traditional + church + reception weddings

**2. Engagement / Customary — GHS 2,000**
- Dual-language option (English + Twi/Ga/Ewe)
- Engagement item checklist for the family
- Private guest list visible only to immediate family
- 15-photo gallery, RSVP with head-count
- Program timeline (arrival → libation → item presentation)
- Background music (highlife, palmwine, hymns)
- Elder-friendly large-text mode
- 90-day hosting, 3 revisions
- Best for: Knocking + customary marriage day

**3. Funeral & Memorial — GHS 2,000**
- Full obituary with biography and life story
- Condolence wall (guests leave written tributes)
- MoMo Nsawa contribution tracker
- Livestream embed for diaspora family
- 15-photo tribute gallery
- Service program (church + burial + reception)
- One-week, 40-day, and 1-year auto-remembrance
- Elder-friendly large-text mode
- 6-month hosting (extendable), 3 revisions
- Best for: Full funerals, memorials, remembrance services

**4. Corporate Event — GHS 3,500**
- Multi-session agenda (main + breakouts)
- Delegate registration with confirmation emails
- Sponsor tier logos and recognition sections
- Speaker bios and session-by-session line-up
- RSVP with dietary + accessibility requirements
- Meeting-room / breakout-room maps
- Post-event survey automation
- Live analytics dashboard
- 90-day hosting, 3 revisions
- Best for: Conferences, launches, AGMs, galas

**5. Naming / Outdooring — GHS 1,500**
- 8-day countdown from birth date
- Baby photo gallery, parents' story
- RSVP with head-count
- Tradition explainer (Din To for international family)
- Background music, program timeline
- 60-day hosting, 2 revisions
- Best for: 8-day naming ceremonies

**6. Milestone Birthday — GHS 2,000** (30th, 40th, 50th, 60th, 70th)
- Life-timeline photo journey (decade by decade)
- Wishes wall (guests leave messages)
- MoMo gift link with contribution tracker
- Photo gallery (up to 20)
- Program timeline (arrival → speeches → cake → dance)
- Guest highlight roll
- 90-day hosting, 3 revisions
- Best for: Big-number birthdays where the whole family gathers

**7. Regular Birthday — GHS 1,200**
- Single-page invitation with theme colours
- RSVP with head-count
- Photo gallery (up to 8)
- Event details, Google Maps, WhatsApp share
- 30-day hosting, 1 revision
- Best for: Kids' parties, 21st birthdays, casual birthdays

**8. Anniversary / Vow Renewal — GHS 1,800**
- Then-vs-now photo comparison
- Love-story timeline (updated with kids, grandkids)
- Kids' tribute messages page
- RSVP, background music (your first-dance song)
- Program timeline for renewal ceremony
- 90-day hosting, 3 revisions
- Best for: Silver / Pearl / Gold / Diamond anniversaries

**9. Graduation — GHS 1,500**
- Journey photos (childhood → graduation)
- Sponsor thank-you page (parents, aunties, uncles)
- MoMo master's-fund contribution link
- RSVP, program details
- 60-day hosting, 2 revisions
- Best for: University, secondary, professional certifications

**10. Church Event — GHS 2,000**
- Multi-day agenda (day-by-day session details)
- Offering MoMo link with per-day tracking
- Livestream embed for members abroad
- Digital program booklet (downloadable)
- Sermon topics and speaker bios per day
- RSVP with head-count
- 90-day hosting, 3 revisions
- Best for: Harvest thanksgiving, conventions, revivals, ordinations

**11. Bespoke — GHS 4,500+** (custom quote)
- Every feature from any package (mix and match)
- Custom domain included (yourevent.com)
- Unlimited photos, videos, and revisions
- White-label (no VibeLink branding anywhere)
- Dedicated account manager (WhatsApp direct line)
- 1-year hosting, priority WhatsApp support
- All AI features + all add-ons included
- Multi-venue and multi-day support
- Best for: High-end weddings, celebrity events, corporate galas, anything unique
- Customers should CONTACT US for a personalized quote — do NOT quote a fixed price for Bespoke

## RUSH DELIVERY (THE ONLY FAST OPTION!)
- **Rush Delivery: +GHS 300** - Get your invitation in 48 hours
- This is an ADD-ON to any package, NOT a separate package
- There is NO "Urgent Vibe" or "Express Vibe" package - those DO NOT EXIST
- To get rush delivery, select it during checkout on any package

## UNIVERSAL ADD-ONS (available on any non-Bespoke package)
- Custom Domain: GHS 500
- Rush Delivery (48 hours): GHS 300
- White-Label (no VibeLink badge): GHS 300
- Extra Hosting (+6 months): GHS 500
- Extra Hosting (+1 year): GHS 1,000
- AI Photo Restoration: GHS 150
- Extra Revision Round: GHS 100
- Priority WhatsApp Support: GHS 200

## EVENT-SPECIFIC ADD-ONS (unlocked only when relevant)

Wedding add-ons:
- Save-the-Date Teaser Page: GHS 500
- Bridal Party Coordination Hub: GHS 300
- Livestream Production Setup: GHS 500
- Interactive Seating Chart: GHS 200
- Twi / Ga / Ewe Subtitles: GHS 200

Engagement add-ons:
- Engagement Item Checklist: GHS 150
- Private Ti Nsa Section: GHS 200
- Twi / Ga / Ewe Subtitles: GHS 200
- Knocking (Kokooko) Teaser: GHS 200

Funeral add-ons:
- Voice Tribute Wall: GHS 300
- Nsawa MoMo Tracking Dashboard: GHS 250
- Full Life-Story Obituary: GHS 150
- Livestream Production Setup: GHS 500
- 1-Year Anniversary Auto-Page: GHS 200

Corporate add-ons:
- Sponsor Tier Logos & Recognition: GHS 200
- Attendee Analytics Dashboard: GHS 300
- Post-Event Survey Automation: GHS 150
- Custom Sub-Domain: GHS 400
- Delegate Badge PDFs: GHS 200

Milestone Birthday add-ons:
- Video Guestbook: GHS 250
- Extended Life Timeline: GHS 200
- Roast Corner: GHS 150

Anniversary add-ons:
- Then-vs-Now Photo Comparison: GHS 200
- Kids' Tribute Messages: GHS 150
- Vow Renewal Service Program: GHS 200

Naming add-ons:
- 8-Day Tradition Explainer: GHS 100
- Libation Ceremony Order: GHS 150
- Baby Time Capsule: GHS 200

Graduation add-ons:
- Sponsor Recognition Wall: GHS 200
- Educational Journey Timeline: GHS 150
- Master's Degree MoMo Fund: GHS 100

Church add-ons:
- Multi-Day Program Agenda: GHS 200
- Offering MoMo Dashboard: GHS 200
- Sermon Notes Download Hub: GHS 150

Regular Birthday: No event-specific add-ons (universal add-ons only)
Bespoke: ALL add-ons included (no extra charge)

## PAYMENT OPTIONS
- **Full Payment (100%)**: Priority processing + FREE "Save the Date" teaser in 24 hours
  (Note: The teaser is free ONLY with full payment. The full invitation still takes 5-7 days)
- **Split Payment (50% + 50%)**: Pay 50% deposit to start, remaining 50% before final delivery

## HOW TO ORDER
1. Go to https://vibelinkevent.com/get-started
2. Fill in your event details
3. Choose your package
4. Add rush delivery (+GHS 300) if you need it in 48 hours
5. Make payment (MoMo or Card)
6. Receive your digital invitation

## TRACK YOUR ORDER
Visit https://vibelinkevent.com/track-order with your Order ID or email.

## EVENT TYPES WE SERVE
Weddings, Funerals, Naming Ceremonies, Birthdays, Corporate Events, Graduations, Church Programs, Anniversaries

## GHANAIAN EVENT KNOWLEDGE
- Kente colors: Gold=royalty, Green=fertility, Red=passion, Blue=peace, Black=maturity
- Adinkra symbols: Gye Nyame, Sankofa, Akoma
- Wedding traditions: Knocking ceremony, traditional engagement, white wedding
- Funeral customs: one-week observance, wake keeping, dress codes
- Naming ceremonies: outdooring, 8 days after birth

## FREE CONSULTATION
ALL consultations are FREE via WhatsApp: https://wa.me/4915757178561

## RESPONSE STYLE
- Warm and friendly, but concise
- Use "Akwaaba!" for greetings when appropriate
- If asked about a service/price NOT listed here, say "I don't have that information. Please contact us on WhatsApp: https://wa.me/4915757178561"
- NEVER make up prices or services`;

// Function to determine topic from user message
function detectTopic(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("package") || lowerMessage.includes("ghs") || lowerMessage.includes("how much")) {
    return "pricing";
  }
  if (lowerMessage.includes("track") || lowerMessage.includes("order") || lowerMessage.includes("status")) {
    return "order_tracking";
  }
  if (lowerMessage.includes("wedding") || lowerMessage.includes("marry") || lowerMessage.includes("bride") || lowerMessage.includes("groom") || lowerMessage.includes("kente")) {
    return "wedding";
  }
  if (lowerMessage.includes("funeral") || lowerMessage.includes("burial") || lowerMessage.includes("memorial") || lowerMessage.includes("tribute")) {
    return "funeral";
  }
  if (lowerMessage.includes("naming") || lowerMessage.includes("outdooring") || lowerMessage.includes("baby")) {
    return "naming_ceremony";
  }
  if (lowerMessage.includes("birthday") || lowerMessage.includes("party")) {
    return "birthday";
  }
  if (lowerMessage.includes("church") || lowerMessage.includes("harvest") || lowerMessage.includes("confirmation") || lowerMessage.includes("baptism")) {
    return "church_event";
  }
  if (lowerMessage.includes("corporate") || lowerMessage.includes("conference") || lowerMessage.includes("meeting") || lowerMessage.includes("business")) {
    return "corporate";
  }
  if (lowerMessage.includes("consult") || lowerMessage.includes("book") || lowerMessage.includes("whatsapp") || lowerMessage.includes("contact")) {
    return "consultation";
  }
  if (lowerMessage.includes("how") && (lowerMessage.includes("work") || lowerMessage.includes("process") || lowerMessage.includes("start"))) {
    return "how_it_works";
  }
  if (lowerMessage.includes("adinkra") || lowerMessage.includes("symbol")) {
    return "adinkra";
  }
  if (lowerMessage.includes("festival") || lowerMessage.includes("homowo") || lowerMessage.includes("akwasidae")) {
    return "festivals";
  }
  return "general";
}

// Function to generate contextual suggestions based on topic
function generateSuggestions(topic: string, lastUserMessage: string): string[] {
  const suggestionSets: Record<string, string[]> = {
    pricing: [
      "What's included in each package?",
      "Do you offer rush delivery?",
      "Can I add printing to my order?",
      "I'd like to place an order"
    ],
    order_tracking: [
      "When will my order be ready?",
      "How do I request revisions?",
      "I'd like to speak to someone",
      "What are your packages?"
    ],
    wedding: [
      "Tell me about Kente colors",
      "What Adinkra symbols are good for weddings?",
      "What about traditional wedding invitations?",
      "How much are wedding packages?"
    ],
    funeral: [
      "What should a funeral program include?",
      "How quickly can you deliver?",
      "Do you do printed programs?",
      "I'd like to place an order"
    ],
    naming_ceremony: [
      "What are outdooring traditions?",
      "How soon should I order invitations?",
      "What packages do you recommend?",
      "Book a consultation"
    ],
    birthday: [
      "What themes are popular?",
      "Can I see examples?",
      "What are your prices?",
      "I'd like to order"
    ],
    church_event: [
      "What about harvest thanksgiving?",
      "Do you do church programs?",
      "What's included in the packages?",
      "Place an order"
    ],
    corporate: [
      "Do you do corporate branding?",
      "What's the turnaround time?",
      "Can I get a custom quote?",
      "Book a consultation"
    ],
    consultation: [
      "What are your prices?",
      "How does the process work?",
      "I have an upcoming event",
      "Track my order"
    ],
    how_it_works: [
      "What packages do you offer?",
      "How long does it take?",
      "Can I track my order?",
      "Book a consultation"
    ],
    adinkra: [
      "Tell me about Gye Nyame",
      "What about Sankofa?",
      "Symbols for weddings?",
      "View pricing"
    ],
    festivals: [
      "When is Homowo?",
      "Tell me about Akwasidae",
      "Festival invitation designs?",
      "Place an order"
    ],
    general: [
      "What services do you offer?",
      "View pricing packages",
      "Track my order",
      "Book a consultation"
    ]
  };

  return suggestionSets[topic] || suggestionSets.general;
}

// Log conversation to analytics
async function logConversation(
  supabase: any,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  topic: string,
  suggestions: string[],
  responseTimeMs: number
) {
  try {
    // Create or get conversation
    let { data: conversation } = await supabase
      .from("chat_conversations")
      .select("id, message_count")
      .eq("session_id", sessionId)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    let conversationId: string;

    if (!conversation) {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({ session_id: sessionId, message_count: 0 })
        .select()
        .single();
      conversationId = newConv?.id;
    } else {
      conversationId = conversation.id;
    }

    if (conversationId) {
      // Insert user message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      // Insert assistant message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
        response_time_ms: responseTimeMs,
        suggestions: suggestions,
      });

      // Update message count
      await supabase
        .from("chat_conversations")
        .update({ message_count: (conversation?.message_count || 0) + 2 })
        .eq("id", conversationId);

      // Update topic analytics
      const { data: existingTopic } = await supabase
        .from("chat_analytics")
        .select("id, count")
        .eq("topic", topic)
        .single();

      if (existingTopic) {
        await supabase
          .from("chat_analytics")
          .update({ count: existingTopic.count + 1, last_asked_at: new Date().toISOString() })
          .eq("id", existingTopic.id);
      } else {
        await supabase.from("chat_analytics").insert({
          topic: topic,
          question_pattern: userMessage.substring(0, 200),
        });
      }
    }
  } catch (error) {
    console.error("Error logging conversation:", error);
    // Don't throw - logging should not break the chat
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, orderId, customerEmail, sessionId } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle order tracking action
    if (action === "track_order" && orderId) {
      let query = supabase
        .from("orders")
        .select("id, event_title, event_type, package_name, order_status, payment_status, total_price, created_at, preferred_delivery_date")
        .eq("id", orderId);

      if (customerEmail) {
        query = query.eq("client_email", customerEmail);
      }

      const { data: order, error } = await query.single();

      if (error || !order) {
        return new Response(
          JSON.stringify({
            message: "I couldn't find an order with that ID. Please double-check your Order ID and try again, or contact us on WhatsApp for assistance: https://wa.me/4915757178561",
            suggestions: ["Try again with correct ID", "Contact via WhatsApp", "View pricing", "Place new order"]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusMessages: Record<string, string> = {
        pending: "Your order has been received and is awaiting processing.",
        in_progress: "Great news! Our designers are currently working on your invitation.",
        draft_ready: "Your draft is ready for review! Check your email for the preview.",
        revision: "We're working on your requested revisions.",
        completed: "Your order is complete! Check your email for the final files.",
        cancelled: "This order was cancelled."
      };

      const paymentMessages: Record<string, string> = {
        pending: "Payment is pending.",
        deposit_paid: "Deposit received - thank you!",
        fully_paid: "Fully paid - thank you!"
      };

      const message = `📋 **Order Found!**

**Order ID**: ${order.id}
**Event**: ${order.event_title} (${order.event_type})
**Package**: ${order.package_name}
**Total**: GHS ${order.total_price.toLocaleString()}

**Order Status**: ${order.order_status.replace('_', ' ').toUpperCase()}
${statusMessages[order.order_status] || ''}

**Payment**: ${paymentMessages[order.payment_status] || order.payment_status}

**Ordered On**: ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${order.preferred_delivery_date ? `**Expected Delivery**: ${new Date(order.preferred_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}

Need help? Chat with us on WhatsApp: https://wa.me/4915757178561`;

      // Generate suggestions based on order status
      let suggestions: string[];
      if (order.order_status === "completed") {
        suggestions = ["Place a new order", "Book consultation", "View pricing", "Contact support"];
      } else if (order.order_status === "draft_ready") {
        suggestions = ["How do I request revisions?", "Contact support", "Place another order", "View other services"];
      } else {
        suggestions = ["When will it be ready?", "Contact support", "View pricing", "Place another order"];
      }

      return new Response(
        JSON.stringify({ message, suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the last user message for topic detection
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const topic = detectTopic(lastUserMessage);
    const startTime = Date.now();

    // Convert messages to Groq/OpenAI format
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Stream chat response using Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Switched from llama-3.1-8b-instant to llama-3.3-70b-versatile 2026-07-22.
        // The 8b was hitting Groq's token-per-minute rate limit on this project's
        // 2,700-token system prompt after just a few messages. The 70b model has
        // much higher TPM limits AND gives noticeably better answers on Ghanaian
        // cultural context.
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "We're experiencing high traffic. Please try again in a moment.",
            suggestions: ["Try again in a minute", "Contact via WhatsApp", "Visit our website"]
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate suggestions for this topic
    const suggestions = generateSuggestions(topic, lastUserMessage);

    // Create a transform stream to append suggestions at the end
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();

    // Process in background - Groq uses OpenAI-compatible SSE format
    (async () => {
      let fullResponse = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  // Forward the SSE event (already in OpenAI format)
                  await writer.write(new TextEncoder().encode(`${line}\n\n`));
                }
              } catch {}
            }
          }
        }

        // Send suggestions as final SSE event
        const suggestionsEvent = `data: ${JSON.stringify({ suggestions })}\n\n`;
        await writer.write(new TextEncoder().encode(suggestionsEvent));
        await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));

        // Log conversation in background (don't block response)
        const responseTime = Date.now() - startTime;
        if (sessionId && fullResponse) {
          logConversation(supabase, sessionId, lastUserMessage, fullResponse, topic, suggestions, responseTime);
        }
      } catch (error) {
        console.error("Stream processing error:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("customer-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
