export const generateAISuggestions = async (apiKey: string, theme: string): Promise<string[]> => {
  if (!theme || theme.trim() === '') {
    throw new Error('テーマが入力されていません。');
  }

  const prompt = `あなたは目標達成やアイデア出しのプロフェッショナルです。
中心テーマ「${theme}」を具体化・達成するために必要な、周囲を囲む8つの具体的な要素（サブテーマや行動目標、アイデア）を考えてください。
出力は、1要素につき15文字以内の短い単語や体言止めで、ちょうど8個をJSONフォーマットの文字列表の配列（Array of Strings）として出力してください。Markdownのコードブロック（\`\`\`jsonなど）は絶対に含めず、純粋なJSON配列のみを返してください。
例: ["要素1", "要素2", "要素3", "要素4", "要素5", "要素6", "要素7", "要素8"]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API Error: ${response.status} ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (resultText) {
      try {
        const parsed = JSON.parse(resultText);
        if (Array.isArray(parsed) && parsed.length >= 8) {
          return parsed.slice(0, 8);
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          // Fallback if AI returned less than 8
          const padded = [...parsed];
          while(padded.length < 8) padded.push("");
          return padded;
        }
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr, "Raw output:", resultText);
        throw new Error("AIが予期せぬフォーマットを返しました。");
      }
    }
    throw new Error("AIからの応答が空でした。");
  } catch (err) {
    console.error("AI Gen Error:", err);
    throw err;
  }
};
