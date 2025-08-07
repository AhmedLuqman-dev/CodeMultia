const languageMap = {
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  javascript: 63,
};

export const executeCode = async (code, language) => {
  const encoded = btoa(code);
  const langId = languageMap[language] || 71;

  const response = await fetch(import.meta.env.VITE_JUDGE0_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      source_code: encoded,
      language_id: langId,
    }),
  });

  const data = await response.json();
  if (data.stderr) return atob(data.stderr);
  if (data.compile_output) return atob(data.compile_output);
  return atob(data.stdout || "No output");
};
