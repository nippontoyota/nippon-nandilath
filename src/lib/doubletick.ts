const DOUBLETICK_API_URL = "https://public.doubletick.io/whatsapp/message/template";
const DOUBLETICK_CONFIRM_TEMPLATE = process.env.DOUBLETICK_CONFIRM_TEMPLATE ?? "nandilath_onam_confirmation_template_v1";

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function callDoubleTick(
  phone: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendResult> {
  const apiKey = process.env.DOUBLETICK_API_KEY;

  // Fallback to mock when no key configured
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
    if (Math.random() < 0.05) throw new Error("DoubleTick mock: simulated transient failure");
    const messageId = `mock_${Math.random().toString(36).slice(2, 10)}`;
    console.log(`[DoubleTick Mock] → ${phone} | tpl=${templateName} | vars=`, variables);
    return { success: true, messageId };
  }

  // Real DoubleTick API call based on docs.doubletick.io
  const body = {
    messages: [
      {
        to: phone,
        from: process.env.DOUBLETICK_FROM ?? "",
        content: {
          templateName: templateName,
          language: "en",
          templateData: {
            body: {
              placeholders: Object.values(variables),
            },
          },
        },
      },
    ],
  };

  const res = await fetch(DOUBLETICK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000), // 10s timeout
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DoubleTick API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const message = data?.messages?.[0];
  if (message?.status === "FAILED" || message?.errorMessage) {
    throw new Error(
      `DoubleTick send failed: ${message.errorMessage ?? message.status ?? "unknown"}`
    );
  }
  return { success: true, messageId: message?.messageId ?? message?.id ?? data?.id };
}

/**
 * Send entry confirmation message (on registration)
 */
export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendResult> {
  return callDoubleTick(phone, templateName, variables);
}

export { DOUBLETICK_CONFIRM_TEMPLATE };
