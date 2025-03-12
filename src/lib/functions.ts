

// src/lib/functions.ts
const fetchData = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  console.log('Veri alınıyor:', url);
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text(); // Ham yanıtı al
    console.log('Hata yanıtı:', text);
    throw new Error(`Hata ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json;
};

export { fetchData };