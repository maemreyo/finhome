# 🛠️ Tech Stack & Package Recommendations

## 📈 Chart & Visualization Libraries

### Primary Choice: **Recharts** 
```bash
npm install recharts@2.13.3
```
**Lý do chọn:**
- React-native, dễ sử dụng với existing stack
- Perfect cho financial dashboards
- Good performance với datasets vừa
- Compatible với shadcn/ui styling

### Financial-Specific: **react-financial-charts**
```bash
npm install react-financial-charts@2.0.1
```
**Use case:** Module 4 advanced features, financial indicators

### Backup/Alternative: **Apache ECharts với echarts-for-react**
```bash
npm install echarts@5.5.1 echarts-for-react@3.0.2
```
**Use case:** Nếu cần handle large datasets >10k points

## 🎭 Animation Libraries

### Primary: **Framer Motion (Motion)**
```bash
npm install framer-motion@11.15.0
```
**Perfect cho:**
- Timeline animations
- Page transitions
- Micro-interactions
- Progress indicators

### Alternative: **React Spring**
```bash
npm install @react-spring/web@9.7.4
```
**Use case:** Physics-based animations cho dòng tiền

## 📊 Excel Export & File Handling

### Core Libraries:
```bash
npm install xlsx@0.18.5 file-saver@2.0.5
npm install @types/file-saver@2.0.7 # if using TypeScript
```

### Enhanced Export (Optional):
```bash
npm install react-excel-export@1.0.6
```

## 📅 Timeline & Date Handling

### Timeline Visualization:
```bash
npm install react-vis-timeline@1.7.3 vis-timeline@7.7.3
npm install vis-data@7.1.9
```

### Date Utilities (Already have date-fns ✅):
- **date-fns@4.1.0** - Already included, perfect choice

## 🧮 Financial Calculations

### Recommended: **Custom Implementation**
- Sử dụng JavaScript native cho loan calculations
- More control over Vietnamese banking specifics
- Easier to customize for local market needs

### Alternative: **financial**
```bash
npm install financial@0.1.1
```

## 🎨 UI Enhancements

### Notification System:
```bash
npm install react-hot-toast@2.4.1
```
**Better than existing sonner for financial notifications**

### Progress & Loading:
```bash
npm install nprogress@0.2.0 react-loading-skeleton@3.5.0
```

### Drag & Drop (cho Financial Lab):
```bash
npm install @dnd-kit/core@1.3.0 @dnd-kit/sortable@8.0.0
```

## 🔐 Additional Security & Validation

### Enhanced Validation:
```bash
npm install joi@17.13.3  # Alternative to zod for complex financial rules
```

### Number Formatting (Vietnamese):
```bash
npm install numeral@2.0.6  # For currency formatting
```

## 🚀 Performance & Optimization

### Virtual Scrolling (cho large datasets):
```bash
npm install react-window@1.8.8 react-window-infinite-loader@1.0.9
```

### Memoization Utilities:
```bash
npm install use-memo-one@1.1.3  # Better than React.memo for complex objects
```

## 📱 Mobile & PWA Support

### Touch Gestures:
```bash
npm install react-use-gesture@9.1.3
```

### PWA Tools:
```bash
npm install next-pwa@5.6.0 workbox-webpack-plugin@7.1.0
```

## 🔧 Development & Testing

### Component Testing:
```bash
npm install @testing-library/react@16.2.0 @testing-library/jest-dom@6.6.3
```

### Visual Testing:
```bash
npm install chromatic@12.0.0  # For Storybook integration
```

## 📊 Package Version Compatibility Matrix

| Category | Package | Version | Compatibility | Notes |
|----------|---------|---------|---------------|--------|
| Charts | recharts | 2.13.3 | ✅ React 19 | Primary choice |
| Charts | react-financial-charts | 2.0.1 | ⚠️ React 18 | Use with --legacy-peer-deps |
| Animation | framer-motion | 11.15.0 | ✅ React 19 | Latest stable |
| Excel | xlsx | 0.18.5 | ✅ Universal | Industry standard |
| Timeline | react-vis-timeline | 1.7.3 | ⚠️ React 18 | Wrapper for vis-timeline |
| UI | react-hot-toast | 2.4.1 | ✅ React 19 | Better notifications |

## 🎯 Installation Commands

### Core Financial Features:
```bash
npm install recharts@2.13.3 framer-motion@11.15.0 xlsx@0.18.5 file-saver@2.0.5
```

### Advanced Features:
```bash
npm install react-financial-charts@2.0.1 react-vis-timeline@1.7.3 vis-timeline@7.7.3
```

### Performance & UX:
```bash
npm install react-hot-toast@2.4.1 numeral@2.0.6 nprogress@0.2.0
```

### Development:
```bash
npm install @types/file-saver@2.0.7 @testing-library/react@16.2.0
```

## ⚠️ Important Notes

1. **React 19 Compatibility:** Some packages may require `--legacy-peer-deps` flag
2. **Bundle Size:** Monitor với `webpack-bundle-analyzer`
3. **Performance:** Use code splitting cho advanced modules
4. **Vietnamese Localization:** Custom formatting cho VND currency

## 🚀 Quick Start Installation

```bash
# Core packages (Phase 1 - MVP)
npm install recharts framer-motion xlsx file-saver react-hot-toast numeral

# Advanced packages (Phase 2)
npm install react-financial-charts react-vis-timeline vis-timeline vis-data --legacy-peer-deps

# Development tools
npm install @types/file-saver @testing-library/react
```
