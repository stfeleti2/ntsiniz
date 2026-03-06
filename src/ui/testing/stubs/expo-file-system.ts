export const cacheDirectory = '/tmp/'
export const documentDirectory = '/tmp/'

export const EncodingType = {
  UTF8: 'utf8',
  Base64: 'base64',
} as const

export async function getInfoAsync(_uri: string) {
  return { exists: false }
}

export async function makeDirectoryAsync(_uri: string, _opts?: any) {}
export async function writeAsStringAsync(_uri: string, _data: string, _opts?: any) {}
export async function readAsStringAsync(_uri: string, _opts?: any) {
  return ''
}
export async function copyAsync(_params: { from: string; to: string }) {}
export async function deleteAsync(_uri: string, _opts?: any) {}
export async function moveAsync(_params: { from: string; to: string }) {}
export async function getContentUriAsync(uri: string) {
  return uri
}

export default {
  cacheDirectory,
  documentDirectory,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
  readAsStringAsync,
  copyAsync,
  deleteAsync,
  moveAsync,
  getContentUriAsync,
}
