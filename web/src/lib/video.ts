export type VideoPlatform = "youtube" | "vimeo" | "tiktok" | "mp4" | "unknown";

export interface ParsedVideo {
  valid: boolean;
  platform: VideoPlatform;
  label: string;
  embedUrl: string | null;
  externalUrl: string;
  videoId?: string;
}

/**
 * Analiza y valida enlaces de video de YouTube, Vimeo, TikTok o archivos directos (.mp4 / .webm)
 * para renderizarlos siempre en contenedor horizontal 16:9.
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
  const url = (rawUrl ?? "").trim();
  if (!url) {
    return {
      valid: false,
      platform: "unknown",
      label: "Sin video",
      embedUrl: null,
      externalUrl: "",
    };
  }

  // 1. YouTube (watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = url.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i,
  );
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      valid: true,
      platform: "youtube",
      label: "YouTube",
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
      externalUrl: url.startsWith("http") ? url : `https://${url}`,
      videoId: id,
    };
  }

  // 2. Vimeo (vimeo.com/123456, player.vimeo.com/video/123456)
  const vimeoMatch = url.match(
    /^(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/|channels\/[\w]+\/)?(\d{5,})/i,
  );
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      valid: true,
      platform: "vimeo",
      label: "Vimeo",
      embedUrl: `https://player.vimeo.com/video/${id}`,
      externalUrl: url.startsWith("http") ? url : `https://${url}`,
      videoId: id,
    };
  }

  // 3. TikTok (tiktok.com/@user/video/123456, vm.tiktok.com/..., tiktok.com/t/...)
  const tiktokVideoMatch = url.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/i,
  );
  if (tiktokVideoMatch && tiktokVideoMatch[1]) {
    const id = tiktokVideoMatch[1];
    return {
      valid: true,
      platform: "tiktok",
      label: "TikTok",
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
      externalUrl: url.startsWith("http") ? url : `https://${url}`,
      videoId: id,
    };
  }

  const tiktokShortMatch = url.match(
    /^(?:https?:\/\/)?(?:vm\.|vt\.|www\.)?tiktok\.com\/(?:t\/)?([a-zA-Z0-9_-]{5,})/i,
  );
  if (tiktokShortMatch && tiktokShortMatch[1]) {
    return {
      valid: true,
      platform: "tiktok",
      label: "TikTok",
      embedUrl: null,
      externalUrl: url.startsWith("http") ? url : `https://${url}`,
      videoId: tiktokShortMatch[1],
    };
  }

  // 4. Archivo directo MP4 o WebM
  const mp4Match = url.match(/^(https?:\/\/[^\s]+\.(?:mp4|webm)(?:\?[^\s]*)?|\/[^\s]+\.(?:mp4|webm))$/i);
  if (mp4Match) {
    return {
      valid: true,
      platform: "mp4",
      label: "Archivo MP4",
      embedUrl: url,
      externalUrl: url,
    };
  }

  return {
    valid: false,
    platform: "unknown",
    label: "Enlace no reconocido",
    embedUrl: null,
    externalUrl: url,
  };
}
