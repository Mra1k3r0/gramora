import type {
  InlineQueryResult,
  InlineQueryResultArticle,
  InlineQueryResultPhoto,
  InlineQueryResultGif,
  InlineQueryResultVideo,
  InlineQueryResultAudio,
  InlineQueryResultDocument,
  InlineQueryResultVoice,
  InlineQueryResultLocation,
  InlineQueryResultCachedPhoto,
  InlineQueryResultCachedGif,
  InlineQueryResultCachedVideo,
  InlineQueryResultCachedDocument,
  InlineQueryResultCachedSticker,
  InputMessageContent,
} from "./types/telegram";

let autoId = 0;
function nextId(): string {
  return String(++autoId);
}

type WithoutTypeAndId<T> = Omit<T, "type" | "id">;

export class InlineResultBuilder {
  private readonly results: InlineQueryResult[] = [];

  article(
    title: string,
    inputMessageContent: InputMessageContent,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultArticle>>,
  ) {
    this.results.push({
      type: "article",
      id: nextId(),
      title,
      input_message_content: inputMessageContent,
      ...extra,
    });
    return this;
  }

  photo(
    photoUrl: string,
    thumbnailUrl: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultPhoto>>,
  ) {
    this.results.push({
      type: "photo",
      id: nextId(),
      photo_url: photoUrl,
      thumbnail_url: thumbnailUrl,
      ...extra,
    });
    return this;
  }

  gif(
    gifUrl: string,
    thumbnailUrl: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultGif>>,
  ) {
    this.results.push({
      type: "gif",
      id: nextId(),
      gif_url: gifUrl,
      thumbnail_url: thumbnailUrl,
      ...extra,
    });
    return this;
  }

  video(
    videoUrl: string,
    mimeType: "text/html" | "video/mp4",
    thumbnailUrl: string,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultVideo>>,
  ) {
    this.results.push({
      type: "video",
      id: nextId(),
      video_url: videoUrl,
      mime_type: mimeType,
      thumbnail_url: thumbnailUrl,
      title,
      ...extra,
    });
    return this;
  }

  audio(
    audioUrl: string,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultAudio>>,
  ) {
    this.results.push({
      type: "audio",
      id: nextId(),
      audio_url: audioUrl,
      title,
      ...extra,
    });
    return this;
  }

  document(
    title: string,
    documentUrl: string,
    mimeType: "application/pdf" | "application/zip",
    extra?: Partial<WithoutTypeAndId<InlineQueryResultDocument>>,
  ) {
    this.results.push({
      type: "document",
      id: nextId(),
      title,
      document_url: documentUrl,
      mime_type: mimeType,
      ...extra,
    });
    return this;
  }

  voice(
    voiceUrl: string,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultVoice>>,
  ) {
    this.results.push({
      type: "voice",
      id: nextId(),
      voice_url: voiceUrl,
      title,
      ...extra,
    });
    return this;
  }

  location(
    latitude: number,
    longitude: number,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultLocation>>,
  ) {
    this.results.push({
      type: "location",
      id: nextId(),
      latitude,
      longitude,
      title,
      ...extra,
    });
    return this;
  }

  cachedPhoto(fileId: string, extra?: Partial<WithoutTypeAndId<InlineQueryResultCachedPhoto>>) {
    this.results.push({
      type: "photo",
      id: nextId(),
      photo_file_id: fileId,
      ...extra,
    } as InlineQueryResultCachedPhoto);
    return this;
  }

  cachedGif(fileId: string, extra?: Partial<WithoutTypeAndId<InlineQueryResultCachedGif>>) {
    this.results.push({
      type: "gif",
      id: nextId(),
      gif_file_id: fileId,
      ...extra,
    } as InlineQueryResultCachedGif);
    return this;
  }

  cachedVideo(
    fileId: string,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultCachedVideo>>,
  ) {
    this.results.push({
      type: "video",
      id: nextId(),
      video_file_id: fileId,
      title,
      ...extra,
    } as InlineQueryResultCachedVideo);
    return this;
  }

  cachedDocument(
    fileId: string,
    title: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultCachedDocument>>,
  ) {
    this.results.push({
      type: "document",
      id: nextId(),
      document_file_id: fileId,
      title,
      ...extra,
    } as InlineQueryResultCachedDocument);
    return this;
  }

  cachedSticker(fileId: string, extra?: Partial<WithoutTypeAndId<InlineQueryResultCachedSticker>>) {
    this.results.push({
      type: "sticker",
      id: nextId(),
      sticker_file_id: fileId,
      ...extra,
    } as InlineQueryResultCachedSticker);
    return this;
  }

  raw(result: InlineQueryResult) {
    this.results.push(result);
    return this;
  }

  build(): InlineQueryResult[] {
    return [...this.results];
  }
}

export const InlineResult = {
  builder: () => new InlineResultBuilder(),

  article(
    title: string,
    inputMessageContent: InputMessageContent,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultArticle>>,
  ): InlineQueryResultArticle {
    return {
      type: "article",
      id: nextId(),
      title,
      input_message_content: inputMessageContent,
      ...extra,
    };
  },

  photo(
    photoUrl: string,
    thumbnailUrl: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultPhoto>>,
  ): InlineQueryResultPhoto {
    return {
      type: "photo",
      id: nextId(),
      photo_url: photoUrl,
      thumbnail_url: thumbnailUrl,
      ...extra,
    };
  },

  gif(
    gifUrl: string,
    thumbnailUrl: string,
    extra?: Partial<WithoutTypeAndId<InlineQueryResultGif>>,
  ): InlineQueryResultGif {
    return { type: "gif", id: nextId(), gif_url: gifUrl, thumbnail_url: thumbnailUrl, ...extra };
  },

  textContent(
    messageText: string,
    parseMode?: "Markdown" | "MarkdownV2" | "HTML",
  ): InputMessageContent {
    return { message_text: messageText, ...(parseMode ? { parse_mode: parseMode } : {}) };
  },
};
