export async function getThumbnailAsync(_uri: string, _options?: any) {
  return {
    uri: '/tmp/storybook-thumbnail.jpg',
    width: 720,
    height: 1280,
  }
}

export default {
  getThumbnailAsync,
}