const languageMap = {
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  javascript: 63,
};

export const executeCode = async (code, language) => {
  const langId = languageMap[language] || 71;
  const base = import.meta.env.VITE_BACKEND_URL;
  const url = `${base.replace(/\/$/, "")}/api/execute`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source_code: code, language_id: langId }),
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const parsed = JSON.parse(text || "{}");
      const message = parsed?.error || parsed?.details || parsed?.message || "Execution failed";
      throw new Error(message);
    } catch (e) {
      const message = text || `${response.status} ${response.statusText}`;
      throw new Error(message);
    }
  }
  if (!text) return "No output";

  try {
    const data = JSON.parse(text);
    return data.output || "No output";
  } catch (e) {
    return text;
  }
};
