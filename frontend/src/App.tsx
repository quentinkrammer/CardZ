import { Table } from "./components/Table";
import { useTestQuery } from "./query/useTestQuery";
import { trpc } from "./trpc";
import { useGameSubscription } from "./useGameSubscription";

function App() {
  const { data } = useTestQuery();
  const playCard = trpc.game.playCard.useMutation();
  const sub = useGameSubscription();

  return (
    <>
      {/* <div>Name: {data?.input}</div>
      <div>ID: {data?.context.userId}</div>
      <button onClick={() => playCard.mutate()}>Play Card</button> */}
      {/* {result.status === "error" && (
        <button onClick={() => result.reset()}>
          Something went wrong - restart the subscription
        </button>
      )} */}
      <div className="h-dvh">
        <Table />
      </div>
    </>
  );
}

export default App;
