import winterCover from "@/assets/covers/winter.png";
import raveCover from "@/assets/covers/rave.png";
import beachCover from "@/assets/covers/beach.png";
import jungleCover from "@/assets/covers/jungle.png";
import winterStickerCover from "@/assets/covers/winter-sticker.png";
import raveStickerCover from "@/assets/covers/rave-sticker.png";
import beachAltCover from "@/assets/covers/beach-alt.png";
import jungleAltCover from "@/assets/covers/jungle-alt.png";

export const COVER_PHOTOS = {
  'winter': winterCover,
  'winter-sticker': winterStickerCover,
  'rave': raveCover,
  'rave-sticker': raveStickerCover,
  'beach': beachCover,
  'beach-alt': beachAltCover,
  'jungle': jungleCover,
  'jungle-alt': jungleAltCover,
} as const;

export type CoverId = keyof typeof COVER_PHOTOS;

export const COVER_OPTIONS = [
  { id: 'winter' as CoverId, name: 'Winter', url: winterCover },
  { id: 'winter-sticker' as CoverId, name: 'Winter Pineapple', url: winterStickerCover },
  { id: 'rave' as CoverId, name: 'Rave', url: raveCover },
  { id: 'rave-sticker' as CoverId, name: 'Rave Pineapple', url: raveStickerCover },
  { id: 'beach' as CoverId, name: 'Beach', url: beachCover },
  { id: 'beach-alt' as CoverId, name: 'Beach Pineapple', url: beachAltCover },
  { id: 'jungle' as CoverId, name: 'Jungle', url: jungleCover },
  { id: 'jungle-alt' as CoverId, name: 'Jungle Hammock', url: jungleAltCover },
];

export const getCoverPhoto = (coverId?: string): string => {
  if (!coverId) return beachCover;
  return COVER_PHOTOS[coverId as CoverId] || beachCover;
};
