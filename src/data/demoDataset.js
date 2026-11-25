export const createDemoDataset = () =>
  Array.from({ length: 28 }, (_, index) => {
    const temperature = Number((30 + index * 1.62).toFixed(4))
    const activity = 6.8 * temperature - 0.064 * temperature * temperature - 57
      + Math.sin(index * 1.31) * 1.25
    return {
      Temperature_C: temperature,
      pH: 6.5,
      Enzyme_Concentration_relative_units: 1.0,
      Substrate_Concentration_mM: 10.0,
      Activity_umol_product_per_min: Number(activity.toFixed(4)),
    }
  })
