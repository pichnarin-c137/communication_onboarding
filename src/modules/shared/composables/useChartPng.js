/**
 * Download a vue-chartjs chart as a PNG.
 *
 * Pass the template ref bound to a <Line>/<Bar>/<Doughnut> component — in
 * vue-chartjs v5 the underlying Chart.js instance is exposed as `.chart`.
 * A white background is composited in first, since toBase64Image() produces
 * a transparent canvas that looks broken on dark viewers.
 */
export function downloadChartPng(chartRef, filename = 'chart.png') {
  const inst = chartRef?.value?.chart
  if (!inst) return

  const src = inst.canvas
  const out = document.createElement('canvas')
  out.width = src.width
  out.height = src.height
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(src, 0, 0)

  const a = document.createElement('a')
  a.href = out.toDataURL('image/png', 1)
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
