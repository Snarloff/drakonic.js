export async function sleep(timeout: number = 50) {
  return await new Promise((resolve) => setTimeout(resolve, timeout))
}
