exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageBase64 or mimeType' }) };
  }

  const prompt = `You are an expert UK freshwater and sea fishing guide. The photo may show an angler holding a fish, a fish on a bank, or a close-up — all are valid. Find the fish in the image and identify it.
Respond with ONLY a valid JSON object — no markdown, no explanation, just the JSON.
Format:
{
  "species": "Common name of the fish species",
  "estimatedLength": "e.g. 18–22 inches",
  "estimatedWeight": "e.g. 4lb 8oz – 6lb",
  "confidence": "high" | "medium" | "low",
  "notes": "One sentence of useful detail about this fish or catch"
}
Confidence rules:
- "high": you can identify the species with certainty from visible features (body shape, fins, colouring, markings)
- "medium": the fish is visible but partially obscured, at an awkward angle, or could be one of two similar species
- "low": the fish is too small, blurry, or hidden to make a reasonable identification
The fish does not need to fill the frame — anglers holding fish is normal. Focus on the fish itself.
If a fish is identifiable, use "high" or "medium". Only use "low" if identification is genuinely not possible.
Only set species to "Unknown" if there is no fish visible at all.
Use imperial units (inches, lb oz). Be specific — don't say 'various sizes'.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const geminiBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
  };

  let geminiRes;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Gemini API' }) };
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    let userMessage = 'Gemini API error';
    let quotaInfo = null;
    try {
      const errJson = JSON.parse(errText);
      userMessage = errJson?.error?.message || userMessage;
      const violations = errJson?.error?.details?.find(d => d['@type']?.includes('QuotaFailure'))?.violations;
      if (violations?.length) {
        quotaInfo = violations.map(v => v.quotaId || v.quotaMetric).filter(Boolean).join(', ');
      }
    } catch { /* leave defaults */ }
    return {
      statusCode: geminiRes.status,
      body: JSON.stringify({ error: userMessage, quotaInfo, detail: errText }),
    };
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  let result;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: 'Unknown',
        estimatedLength: '—',
        estimatedWeight: '—',
        confidence: 'low',
        notes: 'Could not parse AI response. Try a clearer photo.',
      }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
};
