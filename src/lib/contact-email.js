export const CONTACT_EMAIL = "contact@ultravibesllc.com";
export const CONTACT_PHONE = "(520) 542-2286";

const FALLBACK_FROM = import.meta.env.VITE_EMAIL_FROM || "onboarding@resend.dev";
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export function buildQuoteEmailBody(formData) {
  return [
    `Name: ${formData.contact_name || "N/A"}`,
    `Company: ${formData.company_name || "N/A"}`,
    `Email: ${formData.email || "N/A"}`,
    `Phone: ${formData.phone || "N/A"}`,
    `Origin: ${formData.origin || "N/A"}`,
    `Destination: ${formData.destination || "N/A"}`,
    `Equipment: ${formData.equipment_type || "N/A"}`,
    `Pickup Date: ${formData.pickup_date || "N/A"}`,
    "",
    "Freight Details:",
    formData.freight_description || "No additional details provided.",
  ].join("\n");
}

export async function sendContactEmail(formData) {
  const toEmail = import.meta.env.VITE_CONTACT_EMAIL || CONTACT_EMAIL;
  const subject = `Quote Request from ${formData.contact_name || "Customer"}`;
  const body = buildQuoteEmailBody(formData);

  if (!RESEND_API_KEY || !FALLBACK_FROM) {
    window.location.href = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { fallback: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FALLBACK_FROM,
      to: [toEmail],
      subject,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`,
      text: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send email");
  }

  return { fallback: false };
}
