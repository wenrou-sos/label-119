import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  RadarComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'

let registered = false

export function setupECharts() {
  if (registered) return
  use([
    CanvasRenderer,
    BarChart,
    HeatmapChart,
    LineChart,
    PieChart,
    RadarChart,
    ScatterChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
    DataZoomComponent,
    VisualMapComponent,
    RadarComponent,
    MarkLineComponent,
    MarkPointComponent,
    ToolboxComponent,
  ])
  registered = true
}
