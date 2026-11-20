import type { PrivateListing } from "@/lib/data/private";
import type { FeatureGroup, Housing, Operation, PropertyType, Status } from "@/lib/types";

export interface DraftPhoto {
  id: string;
  src: string;
  room: string;
  captionEs?: string;
  captionEn?: string;
  subEs?: string;
  subEn?: string;
  showCaption?: boolean;
  icon?: string;
  customIcon?: string;
}

export interface Draft {
  code: string;
  title: string;
  titleEn: string;
  summary: string;
  description: string;
  operation: Operation;
  status: Status;
  type: PropertyType;
  price: number;
  priceFrom?: boolean;
  zone: string;
  exclusive: boolean;
  featured: boolean;
  slider: boolean;
  housing: Housing;
  progress?: number;
  delivery?: string;
  yearBuilt?: number;
  /** Ficha técnica: "Datos principales" + categorías flexibles. */
  base: { id: string; label: string; value: string; unit?: string; icon: string }[];
  groups: FeatureGroup[];
  photos: DraftPhoto[];
  galleryAutoplaySeconds: number;
  video: string;
  showSimulator: boolean;
  faqs: { q: string; a: string }[];
  priv: PrivateListing;
}
