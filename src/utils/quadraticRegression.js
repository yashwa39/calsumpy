export function quadraticRegression(rows) {
  const points = rows
    .map((row) => ({
      x: Number(row.temperature ?? row.Temperature_C),
      y: Number(row.activity ?? row.Activity_umol_product_per_min),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))

  if (points.length < 3) {
    throw new Error('At least 3 valid observations are required.')
  }

  const n = points.length
  const sumX = points.reduce((sum, point) => sum + point.x, 0)
  const sumX2 = points.reduce((sum, point) => sum + point.x * point.x, 0)
  const sumX3 = points.reduce((sum, point) => sum + point.x ** 3, 0)
  const sumX4 = points.reduce((sum, point) => sum + point.x ** 4, 0)
  const sumY = points.reduce((sum, point) => sum + point.y, 0)
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumX2Y = points.reduce((sum, point) => sum + point.x * point.x * point.y, 0)

  const matrix = [
    [sumX4, sumX3, sumX2, sumX2Y],
    [sumX3, sumX2, sumX, sumXY],
    [sumX2, sumX, n, sumY],
  ]

  for (let col = 0; col < 3; col += 1) {
    let pivot = col
    for (let row = col + 1; row < 3; row += 1) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row
    }
    if (Math.abs(matrix[pivot][col]) < 1e-12) {
      throw new Error('The temperatures do not provide enough variation to fit a quadratic.')
    }
    ;[matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]]
    const divisor = matrix[col][col]
    for (let item = col; item < 4; item += 1) matrix[col][item] /= divisor
    for (let row = 0; row < 3; row += 1) {
      if (row === col) continue
      const factor = matrix[row][col]
      for (let item = col; item < 4; item += 1) matrix[row][item] -= factor * matrix[col][item]
    }
  }

  const [a, b, c] = [matrix[0][3], matrix[1][3], matrix[2][3]]
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    throw new Error('A valid quadratic model could not be calculated.')
  }

  const meanY = sumY / n
  let ssRes = 0
  let ssTot = 0
  points.forEach(({ x, y }) => {
    const predicted = a * x * x + b * x + c
    ssRes += (y - predicted) ** 2
    ssTot += (y - meanY) ** 2
  })

  const vertexX = a < 0 ? -b / (2 * a) : null
  const vertexY = vertexX !== null ? a * vertexX * vertexX + b * vertexX + c : null
  return {
    a, b, c,
    optimum: vertexX,
    maximum: vertexY,
    r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot,
    points,
  }
}
