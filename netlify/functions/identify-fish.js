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

  const prompt = `You are an expert UK freshwater and sea fishing guide. Examine this photo carefully.
Respond with ONLY a valid JSON object — no markdown, no explanation, just the JSON.
Format:
{
  "species": "Common name of the fish species",
  "estimatedLength": "e.g. 18–22 inches",
  "estimatedWeight": "e.g. 4lb 8oz – 6lb",
  "confidence": "high" | "medium" | "low",
  "notes": "One sentence of useful detail about this fish or catch"
}
If you cannot see a fish clearly, set species to "Unknown" and confidence to "low".
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
    generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
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
