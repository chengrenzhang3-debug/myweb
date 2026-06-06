# 极地车项目页图片资源清单

本版 `polar-rover.html` 已经改成 10 段横向叙事，并且先把你上传的 PDF 页面截图放进了 `assets` 文件夹作为临时图。后续你要换成更干净的原图，只要用同名文件覆盖即可。

## 极地车项目页 10 段结构

1. `00 / Overview`：项目总览
2. `01 / Background Research`：高纬度低变化环境调研
3. `02 / User Journey`：用户旅程与痛点
4. `03 / Design Strategy`：移动 + 居住 + 环境补偿 + 社交/独处切换
5. `04 / Exterior Concept`：虎鲸/冰海外饰概念
6. `05 / Exterior Output`：外饰渲染与车辆规格
7. `06 / Interior Experience`：内饰体验与 CMF
8. `07 / Health Cabin System`：森林循环呼吸健康座舱系统
9. `08 / HMI Architecture`：HMI 系统架构
10. `09 / HMI Prototype`：HMI 可交互原型入口
11. `10 / Reflection`：项目总结

页面标题显示到 10，是为了符合“十段内容”的要求；前面的 Overview 算项目开场。

## 图片文件名与建议内容

| 文件名 | 建议尺寸 | 比例 | 内容 |
|---|---:|---:|---|
| `polar_pdf_01_cover.png` | 1920 × 1080 | 16:9 | PolarArk 主视觉 / 车外观大图 |
| `polar_pdf_02_research_signal.png` | 1920 × 1080 | 16:9 | 高纬度低变化调研总结，最好包含光照、视觉、听觉三个问题 |
| `polar_pdf_03_user_journey.png` | 1920 × 1080 | 16:9 | 用户旅程图 / 出行前、准备、途中、停留、返程 |
| `polar_pdf_04_design_strategy.png` | 1920 × 1080 | 16:9 | 设计策略图：扩大生活半径、长期停留、环境输入补偿 |
| `polar_pdf_05_exterior_reference.png` | 1920 × 1080 | 16:9 | 虎鲸/冰海灵感、形态转译草图或参考板 |
| `polar_pdf_06_exterior_render.png` | 1920 × 1080 | 16:9 | 外饰最终渲染图，最好没有太多文字 |
| `polar_pdf_07_vehicle_specs.png` | 1920 × 1080 | 16:9 | 车辆尺寸、参数、轮距、车身比例图 |
| `polar_pdf_08_interior_cmf.png` | 1920 × 1080 | 16:9 | 内饰 CMF：木饰板、暖色皮革、自然元素、纯色点缀 |
| `polar_pdf_09_interior_space.png` | 1920 × 1080 | 16:9 | 内饰空间渲染或布局图 |
| `polar_pdf_10_health_cabin_system.png` | 1920 × 1080 | 16:9 | 森林循环呼吸健康系统：空气、氧气、光照、声音 |
| `polar_pdf_11_hmi_architecture.png` | 1920 × 1080 | 16:9 | HMI 系统架构：车辆检测、无人机控制、中控台、生态舱、通信 |
| `polar_pdf_12_hmi_screen.png` | 1920 × 1080 | 16:9 | HMI 界面截图 |
| `polar_pdf_13_final_system.png` | 1920 × 1080 | 16:9 | 最终系统总结图 / 结尾愿景图 |

## 替换方式

把你做好的图片放进 `assets` 文件夹，并且保持文件名完全一致。比如你重新导出了 HMI 架构图，就把它命名为：

`polar_pdf_11_hmi_architecture.png`

然后覆盖 `assets` 里的旧文件，刷新 `polar-rover.html` 即可。

## 注意

- 这些图片最好都用 16:9 横图。
- 如果你导出 JPG，也可以，但要么改成 `.png` 文件名，要么改代码里的图片路径。
- 最建议先替换：主视觉、外饰渲染、内饰渲染、HMI 截图这四张。


## v5 修正

- 恢复极地车项目页的上下波动排布，不再把所有卡片硬压成同一屏高度。
- 只把原本太靠下的卡片整体向上移动。
- HMI 演示按钮保留可见。
