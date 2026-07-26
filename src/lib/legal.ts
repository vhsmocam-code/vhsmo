/**
 * Policy content for the footer legal pages. Editorial placeholder copy
 * written for VHSMO - a pre-order pocket camera brand shipping in India via
 * Razorpay (payments) and WARIQ Logistics (fulfilment). Review with counsel
 * before launch.
 */

/**
 * A paragraph, or - when an array - a bullet list rendered under the
 * paragraph that precedes it.
 */
export type LegalBlock = string | string[];

export type LegalSection = {
  heading: string;
  body: LegalBlock[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  /** Short label for the footer / cross-link rows. Defaults to `title`. */
  navLabel?: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/** Registered-entity details shared by every policy. */
const LEGAL_CONTACT = "team@vhsmo.com";
const REGISTERED_OFFICE =
  "H. No. 20, Nilaya Kapil, Aasmant Society, S. No. 124/3/4, Armament, Sutarwadi, Pune, Maharashtra – 411021, India";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    updated: "July 2026",
    intro:
      "These terms govern your use of the VHSMO website and your purchase or pre-order of VHSMO products. By placing an order, you agree to them.",
    sections: [
      {
        heading: "1. About VHSMO",
        body: [
          "This website is operated by VHSMO LLP (“VHSMO”, “we”, “us” or “our”), a limited liability partnership registered in India.",
          [
            "LLPIN: ACT-8214",
            `Registered office: ${REGISTERED_OFFICE}`,
            "Website: www.vhsmo.com",
            `Email: ${LEGAL_CONTACT}`,
          ],
          "VHSMO sells cameras, accessories and related products directly to customers through this website.",
        ],
      },
      {
        heading: "2. Eligibility",
        body: [
          "You must be at least 18 years old and legally capable of entering into a binding contract to place an order.",
          "A person under 18 may use the website or purchase a product only through a parent or legal guardian.",
          "You agree to provide accurate, current and complete information during checkout.",
        ],
      },
      {
        heading: "3. Website use",
        body: [
          "You may use the website only for lawful, personal and non-commercial purposes. You must not:",
          [
            "interfere with the website’s operation or security;",
            "introduce viruses, malicious code or automated attacks;",
            "scrape, copy or reproduce website content without permission;",
            "impersonate another person or provide false information;",
            "use the website or our products for an unlawful purpose; or",
            "purchase products for unauthorized resale, export or distribution.",
          ],
          "We may restrict or suspend access where we reasonably believe these Terms have been violated.",
        ],
      },
      {
        heading: "4. Product information",
        body: [
          "We make reasonable efforts to display product descriptions, specifications, photographs, colours and pricing accurately.",
          "However, colours may appear differently depending on your screen, lighting and device settings. Product photographs and renders are illustrative, and minor production variations may occur.",
          "We may make reasonable technical, manufacturing or packaging changes before shipment where they do not materially reduce the product’s core functionality or value.",
          "If a material change affects your order before shipment, we will notify you and provide the option to continue with the order or receive a full refund.",
        ],
      },
      {
        heading: "5. Orders and acceptance",
        body: [
          "Submitting an order is an offer to purchase the selected product.",
          "Your order is accepted when we send an order-confirmation email after successful payment authorization or collection. An automated acknowledgement does not necessarily mean that an order has been accepted.",
          "All orders are subject to:",
          [
            "product availability;",
            "successful payment;",
            "delivery-serviceability;",
            "quantity restrictions; and",
            "fraud and security checks.",
          ],
          "We may decline or cancel an order where:",
          [
            "the product is unavailable;",
            "pricing or product information contains a clear error;",
            "payment fails or is reversed;",
            "the delivery address is incomplete or unserviceable;",
            "the order appears fraudulent; or",
            "the order appears intended for unauthorized resale.",
          ],
          "If we cancel an order after receiving payment, the amount collected will be refunded to the original payment method.",
        ],
      },
      {
        heading: "6. Pre-orders and reservations",
        body: [
          "VHSMO products may be offered before they are ready for immediate shipment.",
          "A pre-order reserves a unit from the stated production batch at the price displayed during checkout, while allocated stock lasts.",
          "The amount and payment timing displayed at checkout form part of your order. Unless checkout expressly states otherwise, the full displayed amount will be charged when the pre-order is placed.",
          "VHSMO is currently in production. Reserved units are scheduled to begin shipping by late August 2026.",
          "If your reserved camera has not shipped by 15 September 2026, you may request a full refund of the amount paid, with no cancellation fee and no questions asked.",
          "A product is considered shipped when it has been handed to our delivery partner and tracking information has been generated.",
          "We will send a production or dispatch update before your camera ships and tracking details after dispatch.",
          "Production and dispatch estimates may be affected by manufacturing, certification, component, logistics or other circumstances outside our reasonable control. Nothing in this section limits your rights under applicable consumer law.",
        ],
      },
      {
        heading: "7. Pricing and taxes",
        body: [
          "Prices are displayed in Indian Rupees.",
          "Unless expressly stated otherwise, prices shown at checkout include applicable Indian taxes. Any delivery fee, if applicable, will be disclosed before payment.",
          "Promotional and pre-order prices may be available only for a limited period or quantity. A later price change will not affect an order that has already been accepted.",
          "We may correct an obvious pricing error. If such an error affects an accepted order, we will contact you and allow you to reconfirm the order at the correct price or receive a full refund.",
        ],
      },
      {
        heading: "8. Payments",
        body: [
          "Payments are processed through authorized third-party payment providers, including Razorpay.",
          "We do not directly store your complete card, UPI or banking credentials. Payment providers may process your information under their own terms and privacy policies.",
          "You confirm that you are authorized to use the payment method submitted with your order.",
          "If a payment is declined, reversed, disputed or identified as unauthorized, we may pause or cancel the associated order.",
        ],
      },
      {
        heading: "9. Shipping and delivery",
        body: [
          "VHSMO currently provides free standard shipping across India, unless checkout states otherwise.",
          "Delivery estimates begin after dispatch and are not guaranteed arrival dates. Delays may occur because of carrier operations, weather, regional restrictions, incorrect addresses or circumstances outside our reasonable control.",
          "Please provide a complete and accurate delivery address. Additional shipping costs caused by an incorrect or incomplete address may be charged to you where permitted by law.",
          "Responsibility for the product remains with VHSMO until delivery is completed at the address provided in the order.",
          `If a shipment is confirmed lost or materially damaged in transit, contact ${LEGAL_CONTACT} so we can investigate and arrange an appropriate replacement or refund.`,
        ],
      },
      {
        heading: "10. Cancellations, returns and refunds",
        body: [
          "Cancellations, returns and refunds are governed by the Refund Policy displayed on our website.",
          "The refund right for delayed pre-orders described in Section 6 applies in addition to the Refund Policy.",
          "Approved refunds will generally be sent to the original payment method. Processing times after approval may depend on your bank, card issuer or payment provider.",
          "Nothing in these Terms excludes any refund, replacement or other remedy that must be provided under applicable Indian consumer law.",
        ],
      },
      {
        heading: "11. Warranty",
        body: [
          "Each VHSMO camera includes a one-year limited warranty from the date of delivery covering verified manufacturing defects and hardware malfunctions arising during normal use.",
          "The warranty does not cover accidental damage, impact, liquid damage, misuse, unauthorized repairs or modifications, theft, loss, cosmetic damage or normal wear and tear.",
          `To submit a warranty claim, email ${LEGAL_CONTACT} with:`,
          [
            "your order number;",
            "a description of the issue; and",
            "a clear photograph or video showing the problem.",
          ],
          "After verification, we may repair or replace the affected product, depending on the nature of the defect and product availability.",
          "The warranty is supplementary to, and does not reduce, your statutory consumer rights.",
        ],
      },
      {
        heading: "12. Third-party services and links",
        body: [
          "The website may use or link to services operated by third parties, including payment processors, delivery partners, social platforms and analytics providers.",
          "We do not control independent third-party websites and are not responsible for their content, availability or privacy practices.",
          "Use of a third-party service may be subject to that provider’s own terms. However, this section does not remove VHSMO’s legal responsibility for your purchase from us.",
        ],
      },
      {
        heading: "13. Intellectual property",
        body: [
          "The website and its contents—including the VHSMO name, logos, product designs, photographs, graphics, copy, videos, software and layout—are owned by or licensed to VHSMO and are protected by applicable intellectual-property laws.",
          "You may access the website for personal use only.",
          "You may not reproduce, modify, distribute, publish, commercially exploit or create derivative works from our content without prior written permission.",
          "No right or licence in VHSMO’s trademarks, product designs, patents or other intellectual property is granted except the limited right to use the website in accordance with these Terms.",
        ],
      },
      {
        heading: "14. Reviews, feedback and submissions",
        body: [
          "Where you voluntarily submit a review, photograph, testimonial, suggestion or other material, you confirm that:",
          [
            "you created it or have permission to share it;",
            "it is accurate and lawful;",
            "it does not violate another person’s rights; and",
            "it does not contain malicious, defamatory or misleading material.",
          ],
          "You grant VHSMO a non-exclusive, worldwide, royalty-free licence to display, reproduce and share the submitted material for operating and promoting VHSMO.",
          "We will not use identifiable customer photographs in advertising without the permissions required by applicable law.",
        ],
      },
      {
        heading: "15. Privacy",
        body: [
          "Our collection and handling of personal data are governed by our Privacy Policy, which explains what information is collected, why it is used, which providers receive it, how long it is retained and how customers may exercise their data rights.",
          "India’s Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025 create separate privacy, notice, consent, security and grievance obligations, with different provisions commencing on different dates.",
        ],
      },
      {
        heading: "16. Website availability and disclaimers",
        body: [
          "We aim to keep the website accurate, secure and available, but we cannot guarantee that access will always be uninterrupted or error-free.",
          "We may temporarily suspend or modify the website for maintenance, security, updates or circumstances outside our control.",
          "Except for the express product warranty and rights that cannot legally be excluded, the website is provided on an “as available” basis.",
        ],
      },
      {
        heading: "17. Limitation of liability",
        body: [
          "To the maximum extent permitted by law, VHSMO will not be responsible for indirect or consequential losses that were not reasonably foreseeable when the order was placed.",
          "Where liability may legally be limited, VHSMO’s total contractual liability relating to an order will not exceed the amount paid for the affected product.",
          "Nothing in these Terms excludes or limits liability for:",
          [
            "fraud or fraudulent misrepresentation;",
            "wilful misconduct;",
            "death or personal injury caused by negligence;",
            "defective-product liability that cannot lawfully be excluded; or",
            "rights and remedies available under Indian consumer law.",
          ],
          "The Consumer Protection Act, 2019 provides statutory protections relating to consumer rights, defective goods, unfair trade practices and misleading representations; contractual language cannot remove non-excludable rights.",
        ],
      },
      {
        heading: "18. Indemnity for unlawful misuse",
        body: [
          "You agree to compensate VHSMO for reasonable losses arising directly from:",
          [
            "your unlawful misuse of the website;",
            "your intentional violation of these Terms;",
            "your infringement of another person’s intellectual-property rights; or",
            "fraudulent information submitted by you.",
          ],
          "This section does not apply to losses caused by VHSMO or limit your statutory consumer rights.",
        ],
      },
      {
        heading: "19. Events outside our control",
        body: [
          "We will not be responsible for delay or failure caused by events beyond our reasonable control, including natural disasters, government restrictions, strikes, transport interruptions, supply shortages, certification delays, network outages or manufacturing disruptions.",
          "Where such an event materially affects an accepted order, we will provide reasonable updates and any cancellation or refund remedy required by law or our published policies.",
        ],
      },
      {
        heading: "20. Electronic communications",
        body: [
          "By placing an order, you agree to receive transactional communications relating to payment, production, dispatch, delivery, warranty and customer support.",
          "Marketing messages will be sent only where permitted and may be unsubscribed from using the option provided.",
          "Electronic order confirmations, notices and policy communications satisfy any requirement for written communication to the extent permitted by law.",
        ],
      },
      {
        heading: "21. Changes to these Terms",
        body: [
          "We may update these Terms to reflect legal, operational or service changes.",
          "The updated version will be published on this page with a revised “Last updated” date.",
          "The version in effect when your order is placed will ordinarily govern that order. Later changes will not reduce rights already attached to an accepted order unless required by law or agreed with you.",
        ],
      },
      {
        heading: "22. Governing law and disputes",
        body: [
          "These Terms are governed by the laws of India.",
          "Before starting formal proceedings, please contact our Grievance Officer so we have an opportunity to resolve the issue.",
          "Nothing in these Terms prevents a consumer from approaching the National Consumer Helpline, a competent Consumer Disputes Redressal Commission or any other authority or court having jurisdiction under applicable law. The National Consumer Helpline accepts pre-litigation grievances through its portal and helpline number 1915.",
        ],
      },
      {
        heading: "23. General provisions",
        body: [
          "If any part of these Terms is found unlawful or unenforceable, the remaining provisions will continue to apply.",
          "A delay by VHSMO in enforcing a right does not waive that right.",
          "You may not transfer your rights or obligations under these Terms without our written consent. We may transfer our obligations as part of a genuine restructuring, merger or sale, provided your existing consumer rights are not reduced.",
          "These Terms, together with the policies incorporated into them and your order confirmation, form the agreement between you and VHSMO concerning the website and your purchase.",
        ],
      },
      {
        heading: "24. Contact & support",
        body: [
          "For questions relating to orders, payments, shipping, cancellations, refunds, warranties, privacy or these Terms, contact:",
          [
            "VHSMO LLP",
            "LLPIN: ACT-8214",
            `Email: ${LEGAL_CONTACT}`,
            `Registered office: ${REGISTERED_OFFICE}`,
          ],
          "Grievance Officer: Dr. Neha Bhilare",
          [
            "Designation: Grievance Officer",
            `Email: ${LEGAL_CONTACT}`,
          ],
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "July 2026",
    intro:
      "VHSMO respects your privacy. This Privacy Policy explains what personal information we collect, why we collect it, how we use it, and the choices available to you when you visit our website, place an order, contact us, or use the VHSMO app.",
    sections: [
      {
        heading: "1. Who we are",
        body: [
          "This website and the VHSMO app are operated by:",
          [
            "VHSMO LLP",
            "LLPIN: ACT-8214",
            `Registered office: ${REGISTERED_OFFICE}`,
            `Email: ${LEGAL_CONTACT}`,
          ],
        ],
      },
      {
        heading: "2. Information we collect",
        body: [
          "Depending on how you use VHSMO, we may collect:",
          [
            "Order information: Your name, email address, phone number, billing and delivery address, order details and transaction status.",
            "Payment information: Payments are processed by Razorpay or another authorised payment provider. VHSMO does not directly store your complete card, UPI or banking credentials.",
            "Communications: Information you provide when contacting customer support, submitting a warranty claim, joining the mailing list or responding to a survey.",
            "Technical information: Your IP address, browser type, device type, operating system, referring pages and general website activity.",
            "App and camera information: Device connection status, camera storage, battery status, app diagnostics and other information required to operate or improve the VHSMO app.",
            "Cookies: Small files used to operate the website, remember preferences, understand site performance and, where you agree, measure marketing activity.",
          ],
        ],
      },
      {
        heading: "3. Your photos",
        body: [
          "Photos transfer directly between your VHSMO camera and your connected device through a local connection.",
          "VHSMO does not upload your photographs to its servers or route them through the cloud as part of the standard wireless-transfer experience.",
          "We will only receive a photograph or video from you when you choose to send it to us—for example, as part of a warranty claim, customer-support request, review, competition or community submission. This matches VHSMO’s privacy-first, cloud-free product design.",
        ],
      },
      {
        heading: "4. How we use your information",
        body: [
          "We use personal information to:",
          [
            "process payments, reservations and orders;",
            "deliver products and provide tracking updates;",
            "operate and improve our website, camera and app;",
            "respond to questions and provide customer support;",
            "process cancellations, refunds and warranty claims;",
            "prevent fraud, misuse and security threats;",
            "send transactional messages about your order;",
            "send marketing updates where you have chosen to receive them; and",
            "comply with tax, accounting and legal obligations.",
          ],
          "We process personal information only for lawful purposes, based on your consent, your request for a product or service, or another basis permitted by applicable law.",
        ],
      },
      {
        heading: "5. When we share information",
        body: [
          "We may share limited personal information with trusted service providers that help us operate VHSMO, including:",
          [
            "payment processors such as Razorpay;",
            "shipping, logistics and fulfilment partners;",
            "website hosting and technology providers;",
            "email, SMS and customer-support providers;",
            "analytics and security providers;",
            "professional advisers such as accountants and lawyers; and",
            "government authorities where disclosure is legally required.",
          ],
          "These providers may use the information only for the service they perform or as otherwise permitted by law.",
          "VHSMO does not sell or rent your personal information.",
        ],
      },
      {
        heading: "6. Cookies and analytics",
        body: [
          "Essential cookies are used to keep the website functioning, secure the checkout process and remember basic preferences.",
          "With your permission, we may also use analytics or marketing cookies to understand website traffic and measure campaigns. You can manage optional cookies through the website’s cookie settings or your browser.",
          "Disabling some cookies may affect how certain parts of the website work.",
        ],
      },
      {
        heading: "7. Marketing messages",
        body: [
          "We may send product updates, launch announcements and other marketing messages when you subscribe or otherwise agree to receive them.",
          `You can unsubscribe at any time using the link in an email or by contacting ${LEGAL_CONTACT}.`,
          "You may still receive essential messages relating to orders, payments, shipping, refunds, warranty claims or security.",
        ],
      },
      {
        heading: "8. How long we keep information",
        body: [
          "We retain personal information only for as long as reasonably required to:",
          [
            "complete your order and provide support;",
            "honour warranty and refund obligations;",
            "maintain tax, accounting and transaction records;",
            "resolve disputes and prevent fraud; or",
            "comply with applicable law.",
          ],
          "When information is no longer required, we will delete it, anonymise it or securely restrict its use.",
        ],
      },
      {
        heading: "9. Security",
        body: [
          "We use reasonable technical and organisational safeguards to protect personal information against unauthorised access, misuse, loss, alteration or disclosure.",
          "No online system can be guaranteed completely secure. If a personal-data breach occurs, we will investigate it and provide notifications where required by law.",
        ],
      },
      {
        heading: "10. Your choices and rights",
        body: [
          "Subject to applicable law, you may ask us to:",
          [
            "provide a summary of the personal information we hold about you;",
            "correct inaccurate or incomplete information;",
            "delete information that is no longer required;",
            "withdraw consent previously given;",
            "stop sending marketing communications; or",
            "explain how your information has been used or shared.",
          ],
          `Email your request to ${LEGAL_CONTACT}. We may ask for reasonable information to verify your identity before completing the request.`,
          "Withdrawing consent does not affect processing already completed before the withdrawal and may prevent us from providing services that require the information.",
        ],
      },
      {
        heading: "11. Children’s privacy",
        body: [
          "Orders must be placed by a person aged 18 or older.",
          `The website and app are not intended to knowingly collect personal information from children without appropriate involvement or consent from a parent or lawful guardian. If you believe a child has provided personal information without such permission, contact ${LEGAL_CONTACT}.`,
        ],
      },
      {
        heading: "12. International processing",
        body: [
          "Some service providers may store or process information outside India. Where this occurs, we will take reasonable steps to ensure that the information is handled securely and transferred only where permitted by applicable law.",
        ],
      },
      {
        heading: "13. Third-party links",
        body: [
          "Our website may contain links to social platforms, payment providers or other third-party websites. Their privacy practices are governed by their own policies, and VHSMO is not responsible for independent third-party websites.",
        ],
      },
      {
        heading: "14. Testing photography",
        body: [
          "During VHSMO’s testing phase, participants consented to being photographed and to the images being used for product testing, our website, and VHSMO social media. Approved images are stored securely and used only for these purposes.",
          `To withdraw your consent or request the removal of a photograph featuring you, email ${LEGAL_CONTACT} with a screenshot, link, or description of the image. After verifying the request, we will remove it from our website and future promotional use within a reasonable period. Withdrawal does not affect uses made before the request was received.`,
        ],
      },
      {
        heading: "15. Changes to this policy",
        body: [
          "We may update this Privacy Policy to reflect changes to our products, services, technology or legal obligations.",
          "The latest version will always appear on this page with the updated date. Where a change materially affects how we use personal information, we will provide an appropriate notice.",
        ],
      },
      {
        heading: "16. Contact us",
        body: [
          "For questions, privacy requests or concerns, contact:",
          [
            "VHSMO LLP",
            `Email: ${LEGAL_CONTACT}`,
            `Registered office: ${REGISTERED_OFFICE}`,
          ],
        ],
      },
    ],
  },
  {
    slug: "refund",
    title: "Refund, Replacement & Warranty Policy",
    navLabel: "Refund Policy",
    updated: "July 2026",
    intro:
      "We want to keep this simple. This policy applies to VHSMO products purchased directly from vhsmo.com.",
    sections: [
      {
        heading: "1. Pre-order refunds",
        body: [
          "VHSMO is currently in production, with reserved units scheduled to ship by late August 2026.",
          "Since each VHSMO is reserved as part of the first production batch, orders cannot be cancelled or refunded once placed, including after dispatch or in cases of a change of mind.",
           "If your order has not shipped by 15 September 2026, you may request a full refund-no questions asked.",
        ],
      },
      {
        heading: "2. Damaged, defective or incorrect orders",
        body: [
          `Contact us at ${LEGAL_CONTACT} if your VHSMO:`,
          [
            "arrives damaged;",
            "is not the product you ordered;",
            "is dead on arrival; or",
            "has a manufacturing defect.",
          ],
          "Please include your order number and a clear photo or video showing the issue. Once verified, we will arrange a repair or replacement at no additional cost.",
          "Where a replacement is unavailable, we may provide a full refund instead.",
        ],
      },
      {
        heading: "3. One-year warranty",
        body: [
          "Every VHSMO camera includes a one-year limited warranty from the date of delivery covering manufacturing defects and hardware malfunctions under normal use.",
          [
            "Covered: Defects in materials or workmanship, dead-on-arrival units and factory-related hardware malfunctions.",
            "Not covered: Damage caused by drops, impact, water or other liquids, misuse, improper charging, unauthorized repairs or modifications, theft, loss, cosmetic damage or normal wear and tear.",
          ],
          "Depending on the issue, VHSMO may repair or replace the camera after verifying the claim.",
        ],
      },
      {
        heading: "4. Returns",
        body: [
          "We do not accept returns for change of mind, colour preference or ordinary cosmetic variation after the product has shipped.",
          "This does not affect your rights where a product is defective, damaged, incorrectly supplied or materially different from its description.",
        ],
      },
      {
        heading: "5. Refund processing",
        body: [
          "Approved refunds will be issued to the original payment method. After processing, the amount may take 5–10 business days to appear, depending on your bank or payment provider.",
          `For assistance, contact ${LEGAL_CONTACT} with your order number.`,
          "Indian consumer law preserves remedies for defective or incorrectly supplied goods, including repair, replacement or refund where applicable; a store policy cannot remove statutory consumer rights.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping Policy",
    updated: "July 2026",
    intro: "This policy applies to orders placed directly through vhsmo.com.",
    sections: [
      {
        heading: "1. Shipping within India",
        body: [
          "VHSMO currently offers free standard shipping across India. Any additional delivery charge, if applicable, will be shown before payment.",
          "Orders are delivered only to serviceable Indian PIN codes.",
        ],
      },
      {
        heading: "2. Pre-order dispatch",
        body: [
          "VHSMO’s first pre-order batch is currently in production and is scheduled to begin shipping by late August 2026.",
          "If your order has not shipped by 15 September 2026, you may request a full refund—no questions asked.",
          "We will send you an update before dispatch and tracking details once your VHSMO is on the way.",
        ],
      },
      {
        heading: "3. Fulfilment and delivery partners",
        body: [
          "We use third-party warehousing, fulfilment and courier providers to store, pack and deliver orders. The delivery partner may vary depending on your location, serviceability and operational availability.",
          "The information required to complete delivery—such as your name, phone number, address and order details—may be shared with these providers in accordance with our Privacy Policy.",
          "Although third-party providers handle fulfilment and last-mile delivery, your purchase remains with VHSMO. Contact us directly if something goes wrong, and we will coordinate tracking, claims and issue resolution. This reflects VHSMO’s current fulfilment arrangement, which provides for outbound shipping, last-mile delivery, tracking and claims coordination through logistics partners.",
        ],
      },
      {
        heading: "4. Delivery estimates",
        body: [
          "Delivery estimates begin after dispatch and will appear in your tracking information. They are estimates, not guaranteed arrival dates.",
          "Delays may occur because of courier operations, weather, regional restrictions, public holidays, transport disruptions or other circumstances outside our reasonable control. We will assist with delayed shipments and provide updates where available.",
        ],
      },
      {
        heading: "5. Delivery address and failed attempts",
        body: [
          "Please provide a complete and accurate delivery address and an active phone number.",
          "VHSMO is not responsible for delays caused by incorrect or incomplete information. If a parcel is returned because of an incorrect address, refusal of delivery or repeated failed attempts, actual re-shipping charges may apply.",
        ],
      },
      {
        heading: "6. Lost, damaged or incorrect shipments",
        body: [
          `If your order arrives visibly damaged, contains the wrong product or appears to be lost in transit, email ${LEGAL_CONTACT} with your order number and supporting photographs or video.`,
          "We will investigate the issue with our fulfilment and courier partners and arrange an appropriate replacement or refund where applicable. Your rights regarding defective, damaged or incorrectly supplied goods remain protected under applicable Indian consumer law.",
        ],
      },
      {
        heading: "7. Contact",
        body: [
          "For shipping or delivery support:",
          [
            "VHSMO LLP",
            `Email: ${LEGAL_CONTACT}`,
            "LLPIN: ACT-8214",
            `Registered office: ${REGISTERED_OFFICE}`,
          ],
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
