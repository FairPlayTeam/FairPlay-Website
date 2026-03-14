export const formatTime = (time: number) => {
  const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0
  const minutes = Math.floor(safeTime / 60)
  const seconds = Math.floor(safeTime % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
