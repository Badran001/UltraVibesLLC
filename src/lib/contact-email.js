export const CONTACT_EMAIL = "contact@ultravibesllc.com";
export const CONTACT_PHONE = "(520) 542-2286";

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/send-contact.php";

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
  const response = await fetch(CONTACT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send email";
    try {
      const result = await response.json();
      errorMessage = result.error || errorMessage;
    } catch {
      // Keep the generic message when the server does not return JSON.
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
