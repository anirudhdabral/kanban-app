import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { Id, Task } from '../types';


interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void
}

export const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
    setMouseIsOver(false);
  }

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return <div ref={setNodeRef}
      style={style} className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500 cursor-grab relative opacity-30' />
  }

  if (editMode) {
    return (
      <div ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners} className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative'>
        <textarea className='
    h-[90%]
    w-full resize-none border-none rounded bg-transparent text-white focus:outline-none
    ' value={task.content} autoFocus placeholder='Task content here' onBlur={toggleEditMode} onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) toggleEditMode()
          }}
          onChange={e => updateTask(task.id, e.target.value)}></textarea>
      </div>)
  }

  return (
    <div ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners} onClick={toggleEditMode} className='bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative' onMouseEnter={() => setMouseIsOver(true)} onMouseLeave={() => setMouseIsOver(false)}>
      <p className='my-auto h-[90%] w-full overflow-x-hidden overflow-y-auto whitespace-pre-wrap'>

        {task.content}
      </p>
      {mouseIsOver && <button onClick={() => {
        deleteTask(task.id);
      }} className="text-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor rounded p-2 opacity-60 hover:opacity-100"><FaTrash /></button>}
    </div>
  )
}
