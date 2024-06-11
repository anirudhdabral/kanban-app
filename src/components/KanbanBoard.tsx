import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus } from "react-icons/fa6";
import { Column, Id, Task } from "../types";
import { ColumnContainer } from "./ColumnContainer";
import { TaskCard } from "./TaskCard";

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const exisitingData = JSON.parse(
        localStorage.getItem("kanban-board") || ""
      );
      setColumns(exisitingData.columns);
      setTasks(exisitingData.tasks);
    } catch (error) {
      console.log("No previous data found");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(
        "kanban-board",
        JSON.stringify({
          columns,
          tasks,
        })
      );
    }
  }, [columns, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const handleAddCoumn = () => {
    const newColumn: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns((prev) => [...prev, newColumn]);
  };
  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };
  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
    const filteredTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(filteredTasks);
  };
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };
  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: ``,
    };
    setTasks([...tasks, newTask]);
  };
  const updateTask = (id: Id, content: string) => {
    const newTasks: Task[] = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  };

  const deleteTask = (id: Id) => {
    const newTasks: Task[] = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    setColumns((prev) => {
      const activeIndex = prev.findIndex((col) => col.id === activeId);
      const overIndex = prev.findIndex((col) => col.id === overId);
      return arrayMove(prev, activeIndex, overIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        tasks[activeIndex].columnId = overId;
        return arrayMove(prev, activeIndex, activeIndex);
      });
    }
  };
  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        sensors={sensors}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={handleAddCoumn}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2 items-center"
          >
            <FaPlus />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                updateColumn={updateColumn}
                column={activeColumn}
                deleteColumn={deleteColumn}
                createTask={createTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};
