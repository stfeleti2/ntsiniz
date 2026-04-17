export async function getDocumentAsync() {
  return {
    canceled: true,
    assets: [],
  }
}

export default {
  getDocumentAsync,
}