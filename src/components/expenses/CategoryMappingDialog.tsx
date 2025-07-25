// src/components/expenses/CategoryMappingDialog.tsx
// Dialog for mapping expense categories to budget groups (Needs/Wants/Savings)
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd'
import { 
  Target, 
  Heart, 
  PiggyBank, 
  GraduationCap,
  Gamepad2,
  TrendingUp,
  Gift,
  Info,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  BudgetMethodConfig, 
  CategoryMapping, 
  getDefaultCategoryMapping 
} from '@/lib/utils/budgetCalculations'

interface Category {
  id: string
  name_vi: string
  name_en: string
  icon: string
  color: string
  category_key?: string
}

interface CategoryMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  budgetConfig: BudgetMethodConfig
  initialMapping?: CategoryMapping
  onMappingComplete: (mapping: CategoryMapping) => void
  onSkip?: () => void
}

export function CategoryMappingDialog({
  open,
  onOpenChange,
  categories,
  budgetConfig,
  initialMapping,
  onMappingComplete,
  onSkip
}: CategoryMappingDialogProps) {
  const [mapping, setMapping] = useState<CategoryMapping>(
    initialMapping || getDefaultCategoryMapping(budgetConfig.key, categories)
  )
  const [unmappedCategories, setUnmappedCategories] = useState<Category[]>([])

  useEffect(() => {
    if (open) {
      // Reset mapping when dialog opens
      const defaultMapping = getDefaultCategoryMapping(budgetConfig.key, categories)
      setMapping(initialMapping || defaultMapping)
      
      // Find unmapped categories
      const mappedIds = new Set(Object.keys(initialMapping || defaultMapping))
      setUnmappedCategories(categories.filter(cat => !mappedIds.has(cat.id)))
    }
  }, [open, categories, budgetConfig.key, initialMapping])

  const handleCategoryGroupChange = (categoryId: string, groupKey: string) => {
    setMapping(prev => ({
      ...prev,
      [categoryId]: groupKey
    }))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const categoryId = result.draggableId

    // Move category to new group
    if (source.droppableId !== destination.droppableId) {
      setMapping(prev => ({
        ...prev,
        [categoryId]: destination.droppableId
      }))
    }
  }

  const getCategoriesByGroup = (groupKey: string): Category[] => {
    return categories.filter(cat => mapping[cat.id] === groupKey)
  }

  const getGroupIcon = (groupKey: string) => {
    switch (groupKey) {
      case 'needs':
        return <Target className="h-4 w-4" />
      case 'wants':
        return <Heart className="h-4 w-4" />
      case 'savings':
        return <PiggyBank className="h-4 w-4" />
      case 'necessities':
        return <Target className="h-4 w-4" />
      case 'education':
        return <GraduationCap className="h-4 w-4" />
      case 'ltss':
        return <PiggyBank className="h-4 w-4" />
      case 'play':
        return <Gamepad2 className="h-4 w-4" />
      case 'financial_freedom':
        return <TrendingUp className="h-4 w-4" />
      case 'give':
        return <Gift className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const handleComplete = () => {
    onMappingComplete(mapping)
    onOpenChange(false)
  }

  const isAllCategoriesMapped = categories.every(cat => mapping[cat.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Map Categories to {budgetConfig.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col gap-4">
            {/* Method Description */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {budgetConfig.description}. Drag categories to the appropriate groups below or use the dropdown selectors.
              </AlertDescription>
            </Alert>

            {/* Category Mapping */}
            <div className="flex-1 overflow-hidden">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid gap-4 h-full" style={{ gridTemplateColumns: `repeat(${budgetConfig.groups.length}, 1fr)` }}>
                  {budgetConfig.groups.map(group => (
                    <Droppable key={group.key} droppableId={group.key}>
                      {(provided, snapshot) => (
                        <Card 
                          className={cn(
                            "flex flex-col h-full",
                            snapshot.isDraggingOver && "bg-muted/50"
                          )}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle 
                              className="text-sm flex items-center gap-2"
                              style={{ color: group.color }}
                            >
                              {getGroupIcon(group.key)}
                              {group.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {group.description}
                            </p>
                          </CardHeader>
                          
                          <CardContent className="flex-1 pt-0">
                            <div
                              {...(provided as any).droppableRef}
                              className="space-y-2 min-h-[200px]"
                            >
                              <ScrollArea className="h-full">
                                {getCategoriesByGroup(group.key).map((category, index) => (
                                  <Draggable
                                    key={category.id}
                                    draggableId={category.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "mb-2 last:mb-0",
                                          snapshot.isDragging && "rotate-2"
                                        )}
                                      >
                                        <div className="flex items-center justify-between p-2 rounded border bg-background hover:bg-muted/50 transition-colors">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div 
                                              className="w-3 h-3 rounded-full flex-shrink-0"
                                              style={{ backgroundColor: category.color }}
                                            />
                                            <span className="text-sm truncate">
                                              {category.name_vi}
                                            </span>
                                          </div>
                                          <Select
                                            value={mapping[category.id]}
                                            onValueChange={(value) => handleCategoryGroupChange(category.id, value)}
                                          >
                                            <SelectTrigger className="w-[120px] h-6 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {budgetConfig.groups.map(g => (
                                                <SelectItem key={g.key} value={g.key} className="text-xs">
                                                  <div className="flex items-center gap-1">
                                                    {getGroupIcon(g.key)}
                                                    {g.name.split('(')[0].trim()}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </ScrollArea>
                              {provided.placeholder}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Droppable>
                  ))}
                </div>
              </DragDropContext>
            </div>

            {/* Examples for each group */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Category Examples:</h4>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${budgetConfig.groups.length}, 1fr)` }}>
                {budgetConfig.groups.map(group => (
                  <div key={group.key} className="text-xs">
                    <div className="font-medium mb-1" style={{ color: group.color }}>
                      {group.name}:
                    </div>
                    <div className="text-muted-foreground space-y-0.5">
                      {group.examples.slice(0, 3).map(example => (
                        <div key={example}>• {example}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            {isAllCategoriesMapped ? (
              <Badge variant="secondary" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                All categories mapped
              </Badge>
            ) : (
              <Badge variant="outline">
                {Object.keys(mapping).length} of {categories.length} mapped
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            <Button 
              onClick={handleComplete}
              disabled={!isAllCategoriesMapped}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Continue with mapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}