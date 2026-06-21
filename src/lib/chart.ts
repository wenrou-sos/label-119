import type { EChartsOption } from 'echarts'

export const chartColors = {
  acid: '#b6ff3a',
  ember: '#ff6b35',
  steel: '#38bdf8',
  violet: '#a78bfa',
  gold: '#f4c544',
  text: '#8b93a7',
  line: '#232733',
  fg: '#e6e9ef',
  panel: '#0f1117',
}

export const baseGrid = {
  left: 12,
  right: 16,
  top: 24,
  bottom: 8,
  containLabel: true,
}

export const axisStyle = {
  axisLine: { lineStyle: { color: chartColors.line } },
  axisTick: { show: false },
  axisLabel: { color: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono' },
  splitLine: { lineStyle: { color: 'rgba(35,39,51,0.5)', type: [4, 4] as unknown as string } },
}

export const baseTooltip: EChartsOption['tooltip'] = {
  trigger: 'axis',
  backgroundColor: chartColors.panel,
  borderColor: chartColors.line,
  borderWidth: 1,
  textStyle: { color: chartColors.fg, fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px -8px rgba(0,0,0,0.6); border-radius: 8px;',
}

export const heatTooltip: EChartsOption['tooltip'] = {
  position: 'top',
  backgroundColor: chartColors.panel,
  borderColor: chartColors.line,
  borderWidth: 1,
  textStyle: { color: chartColors.fg, fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px -8px rgba(0,0,0,0.6); border-radius: 8px;',
}

export const legendStyle = {
  textStyle: { color: chartColors.text, fontSize: 11 },
  icon: 'roundRect',
  itemWidth: 10,
  itemHeight: 10,
  itemGap: 14,
}
