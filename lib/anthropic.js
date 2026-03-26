export async function parseFood(input) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are a nutrition parser. Return ONLY JSON:
{
  "food": string,
  "portion": string,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "tags": string[]
}`,
      messages: [{ role: 'user', content: input }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.content.map(b => b.text || '').join('');
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}
