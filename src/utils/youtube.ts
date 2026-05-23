export function youtubeIdFromInput(input: string) {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").slice(0, 11);
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return id.slice(0, 11);
      const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts?.[1]) return shorts[1];
      const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed?.[1]) return embed[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function thumbnailFor(sourceId: string) {
  return `https://img.youtube.com/vi/${sourceId}/hqdefault.jpg`;
}
