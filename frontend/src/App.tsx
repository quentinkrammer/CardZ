import "./App.css";
import { useTestQuery } from "./query/useTestQuery";

function App() {
  const { data } = useTestQuery();

  return (
    <>
      <div>Name: {data?.input}</div>
      <div>ID: {data?.context.userId}</div>
    </>
  );
}

export default App;
