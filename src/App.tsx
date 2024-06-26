import { RiHeartFill } from "react-icons/ri";
import { KanbanBoard } from "./components/KanbanBoard";

function App() {
  return (
    <>
      <KanbanBoard />
      <span className="fixed bottom-0 right-0 pr-2 mb-1 text-gray-400 flex">
        made with React + TS + ❤️
      </span>
    </>
  );
}

export default App;
