'use client'

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ProjectComponent } from '@/types/project'

// Define item types for drag and drop
export const ItemTypes = {
  COMPONENT: 'component',
}

// Define the context type
interface DragDropContextType {
  moveComponent: (dragId: string, hoverId: string) => void
  findComponent: (id: string) => { component: ProjectComponent; index: number } | null
  components: ProjectComponent[]
  setComponents: (components: ProjectComponent[]) => void
}

// Create the context
const DragDropContext = createContext<DragDropContextType | null>(null)

// Hook to use the drag-drop context
export const useDragDrop = () => {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

interface DragDropProviderProps {
  children: ReactNode
  initialComponents: ProjectComponent[]
  onComponentsChange?: (components: ProjectComponent[]) => void
}

/**
 * DragDropProvider component
 * Provides drag and drop functionality for components
 */
export function DragDropProvider({
  children,
  initialComponents,
  onComponentsChange,
}: DragDropProviderProps) {
  const [components, setComponents] = useState<ProjectComponent[]>(initialComponents)

  // Update parent when components change
  const updateComponents = (newComponents: ProjectComponent[]) => {
    setComponents(newComponents)
    if (onComponentsChange) {
      onComponentsChange(newComponents)
    }
  }

  // Find a component by ID
  const findComponent = (id: string) => {
    const index = components.findIndex((c) => c.id === id)
    if (index === -1) return null
    return { component: components[index], index }
  }

  // Move a component in the list
  const moveComponent = (dragId: string, hoverId: string) => {
    const dragItem = findComponent(dragId)
    const hoverItem = findComponent(hoverId)

    if (!dragItem || !hoverItem) return

    // Don't replace items with themselves
    if (dragItem.index === hoverItem.index) return

    // Create a new array with the updated order
    const newComponents = [...components]
    const [removed] = newComponents.splice(dragItem.index, 1)
    newComponents.splice(hoverItem.index, 0, removed)

    // Update the position property based on the new order
    const updatedComponents = newComponents.map((component, index) => ({
      ...component,
      position: component.position.includes('-')
        ? `${component.position.split('-')[0]}-${index}`
        : `${component.position}-${index}`,
    }))

    updateComponents(updatedComponents)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider
        value={{
          moveComponent,
          findComponent,
          components,
          setComponents: updateComponents,
        }}
      >
        {children}
      </DragDropContext.Provider>
    </DndProvider>
  )
}

interface DraggableComponentProps {
  id: string
  index: number
  children: ReactNode
  isEditMode: boolean
}

/**
 * DraggableComponent component
 * Makes a component draggable
 */
export function DraggableComponent({
  id,
  index,
  children,
  isEditMode,
}: DraggableComponentProps) {
  const { moveComponent } = useDragDrop()
  const ref = useRef<HTMLDivElement>(null)

  // Set up drag source
  const [{ isDragging }, connectDrag] = useDrag({
    type: ItemTypes.COMPONENT,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditMode,
  })

  // Set up drop target
  const [{ isOver }, connectDrop] = useDrop({
    accept: ItemTypes.COMPONENT,
    hover: (item: { id: string; index: number }) => {
      if (item.id !== id) {
        moveComponent(item.id, id)
        item.index = index
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })
  
  // Connect the drag and drop refs to the div
  useEffect(() => {
    if (ref.current) {
      // Create a function that calls both connectDrag and connectDrop
      const dragDropRef = (node: HTMLElement | null) => {
        connectDrag(node)
        connectDrop(node)
      }
      
      dragDropRef(ref.current)
    }
  }, [connectDrag, connectDrop, ref])

  // If not in edit mode, just render the children
  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditMode ? 'move' : 'default',
        position: 'relative',
      }}
      className={`transition-all ${isOver ? 'border-2 border-blue-500 border-dashed' : ''}`}
    >
      {children}
      {isEditMode && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-br-md opacity-50 hover:opacity-100 transition-opacity">
          {index + 1}
        </div>
      )}
    </div>
  )
}

/**
 * DropZone component
 * Creates a drop zone for components
 */
export function DropZone({
  onDrop,
  children,
  className = '',
}: {
  onDrop: (item: { id: string; index: number }) => void
  children?: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isOver }, connectDrop] = useDrop({
    accept: ItemTypes.COMPONENT,
    drop: (item: { id: string; index: number }) => {
      onDrop(item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })
  
  // Connect the drop ref to the div
  useEffect(() => {
    if (ref.current) {
      connectDrop(ref.current)
    }
  }, [connectDrop, ref])

  return (
    <div
      ref={ref}
      className={`${className} ${
        isOver ? 'bg-blue-500/20 border-2 border-blue-500 border-dashed' : ''
      } transition-all`}
    >
      {children}
    </div>
  )
}
