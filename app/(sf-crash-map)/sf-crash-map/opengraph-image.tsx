import {
  renderSfCrashMapSocialImage,
  sfCrashMapSocialImageAlt,
  sfCrashMapSocialImageContentType,
  sfCrashMapSocialImageSize,
} from '../_lib/social-image'

export const alt = sfCrashMapSocialImageAlt
export const size = sfCrashMapSocialImageSize
export const contentType = sfCrashMapSocialImageContentType

export default function Image() {
  return renderSfCrashMapSocialImage()
}
