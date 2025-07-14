# Contextual Help System - Integration Guide

## Overview

The FinHome contextual help system provides intelligent, user-friendly assistance throughout the application. It includes tooltips, popovers, callouts, and financial term explanations.

## Components

### 1. HelpTooltip
Basic tooltip for quick help text.

```tsx
import { HelpTooltip } from '@/components/help'

<HelpTooltip 
  content="Quick explanation text"
  title="Optional title"
  position="top"
>
  <Button>Hover me</Button>
</HelpTooltip>
```

### 2. FinancialTermTooltip  
Specialized for financial terms with Vietnamese explanations.

```tsx
import { FinancialTermTooltip } from '@/components/help'

<FinancialTermTooltip
  term="Lãi Suất"
  definition="Tỷ lệ phần trăm bạn phải trả hàng năm"
  example="8%/năm nghĩa là trả thêm 8% mỗi năm"
  moreInfoUrl="https://..."
>
  Lãi Suất
</FinancialTermTooltip>
```

### 3. HelpIconTooltip
Simple help icon with tooltip.

```tsx
import { HelpIconTooltip } from '@/components/help'

<Label className="flex items-center gap-2">
  Field Name
  <HelpIconTooltip 
    content="Explanation of this field"
    size="sm"
  />
</Label>
```

### 4. HelpPopover
Detailed help content in popover format.

```tsx
import { HelpPopover } from '@/components/help'

<HelpPopover
  title="Feature Name"
  content={<DetailedHelpContent />}
  position="bottom"
>
  <Button>Click for help</Button>
</HelpPopover>
```

### 5. FeatureHelpPopover
Comprehensive feature explanation with steps, tips, and related features.

```tsx
import { FeatureHelpPopover } from '@/components/help'

<FeatureHelpPopover
  title="Financial Calculator"
  description="Advanced calculation tool..."
  steps={[
    "Enter property value",
    "Set down payment",
    "Choose interest rate"
  ]}
  tips={[
    "20-30% down payment gets better rates",
    "Compare multiple banks"
  ]}
  relatedFeatures={["Scenario Comparison", "ROI Analysis"]}
  videoUrl="https://..."
  docsUrl="https://..."
>
  <Info className="w-4 h-4" />
</FeatureHelpPopover>
```

### 6. QuickHelpPopover
Financial term with formula and example.

```tsx
import { QuickHelpPopover } from '@/components/help'

<QuickHelpPopover
  term="ROI"
  definition="Return on Investment calculation"
  formula="ROI = (Gain - Cost) / Cost × 100%"
  example={{
    scenario: "Investment of 1 billion",
    calculation: "(1.2B - 1B) / 1B × 100%",
    result: "20% ROI"
  }}
>
  ROI
</QuickHelpPopover>
```

### 7. HelpCallout
Overlay messages for announcements and important information.

```tsx
import { HelpCallout } from '@/components/help'

<HelpCallout
  id="feature-announcement"
  title="New Feature Available!"
  content="We've added scenario comparison..."
  type="tip"
  position="top"
  actions={[
    { label: "Try it", action: () => {}, variant: "primary" },
    { label: "Learn more", action: () => {}, variant: "secondary" }
  ]}
  onDismiss={() => {}}
/>
```

## Setup & Usage

### 1. Wrap your app with HelpProvider

```tsx
// In your layout or main component
import { HelpProvider } from '@/components/help'

export default function Layout({ children }) {
  return (
    <HelpProvider>
      {children}
    </HelpProvider>
  )
}
```

### 2. Add data-help attributes for contextual help

```tsx
// Add to elements that should have contextual help
<div data-help="create-plan">
  <Button>Create Plan</Button>
</div>
```

### 3. Use the help hook for advanced control

```tsx
import { useHelp } from '@/components/help'

function MyComponent() {
  const { showHelp, hideHelp, shouldShowHelp } = useHelp()
  
  const handleAction = () => {
    if (shouldShowHelp('advanced-feature')) {
      showHelp('advanced-feature')
    }
  }
}
```

## Best Practices

### 1. When to use each component:

- **HelpTooltip**: Simple explanations (1-2 sentences)
- **FinancialTermTooltip**: Vietnamese financial terms
- **HelpPopover**: Detailed explanations with formatting
- **FeatureHelpPopover**: Complete feature walkthroughs
- **HelpCallout**: Important announcements, tutorials

### 2. Content Guidelines:

- Use Vietnamese for financial terms and explanations
- Keep tooltips under 50 words
- Include examples for complex concepts
- Provide formulas for calculations
- Link to detailed documentation when relevant

### 3. UX Guidelines:

- Use `hover` trigger for informational content
- Use `click` trigger for detailed help
- Position tooltips to avoid blocking important UI
- Make help dismissible for experienced users
- Show contextual help based on user level

### 4. Integration Examples:

#### Form Fields
```tsx
<FormField
  name="interestRate"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        <FinancialTermTooltip
          term="Lãi Suất"
          definition="Tỷ lệ bạn phải trả hàng năm"
        >
          Lãi Suất
        </FinancialTermTooltip>
        <HelpIconTooltip 
          content="Nhập lãi suất từ ngân hàng" 
        />
      </FormLabel>
      <FormControl>
        <Input {...field} data-help="interest-rate" />
      </FormControl>
    </FormItem>
  )}
/>
```

#### Feature Buttons
```tsx
<div className="flex items-center gap-2">
  <Button data-help="scenario-comparison">
    Compare Scenarios
  </Button>
  <FeatureHelpPopover
    title="Scenario Comparison"
    description="Compare multiple loan options..."
    steps={["Select plans", "View comparison", "Export report"]}
  >
    <Info className="w-4 h-4 text-muted-foreground" />
  </FeatureHelpPopover>
</div>
```

#### Achievement Notifications
```tsx
import { AchievementCallout } from '@/components/help'

// Show when user unlocks achievement
<AchievementCallout
  achievementTitle="First Plan Created"
  achievementDescription="You've created your first financial plan!"
  xpEarned={50}
  onViewAchievements={() => router.push('/achievements')}
  onContinue={() => setShowCallout(false)}
/>
```

## Vietnamese Financial Terms

The system includes pre-defined Vietnamese financial terms:

- **Vốn Tự Có** (Down Payment)
- **Lãi Suất** (Interest Rate) 
- **ROI** (Return on Investment)
- **DTI** (Debt-to-Income Ratio)
- **Dòng Tiền** (Cash Flow)

Add new terms in `/src/types/help.ts`:

```tsx
export const FINANCIAL_HELP_CONTENT: Record<string, HelpContent> = {
  newTerm: {
    id: 'new-term',
    title: 'Vietnamese Term',
    description: 'Short description',
    content: 'Detailed explanation in Vietnamese...',
    type: 'tooltip',
    category: 'calculation',
    priority: 'medium',
    tags: ['tag1', 'tag2'],
    lastUpdated: new Date()
  }
}
```

## Performance Notes

- Help content is lazy-loaded and cached
- User preferences are stored in localStorage
- Tooltips have optimized positioning algorithms
- Help state is context-aware and doesn't render unnecessarily

## Development Tips

1. **Test with different user levels** - Help visibility changes based on onboarding completion
2. **Check mobile responsiveness** - Tooltips auto-adjust positioning
3. **Verify Vietnamese text rendering** - Ensure proper font support
4. **Test dismissal persistence** - Help items stay dismissed across sessions
5. **Monitor performance** - Large help content should be lazy-loaded