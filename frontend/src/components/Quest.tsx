import classNames from "classnames";
import { isNil } from "lodash";
import { Card, CardProps } from "./Card";

type QuestProps = CardProps & { status?: "failed" | "success" };
export function Quest({ status, ...forwardCardProps }: QuestProps) {
  const isSuccess = status === "success";
  const isFailure = status === "failed";
  const isOngoing = isNil(status);

  return (
    <div
      className={classNames(
        "aspect-[0.82] max-w-20 rounded-md border-1 border-gray-300 bg-radial p-3",
        {
          ["from-red-900 via-red-800 to-red-950"]: isFailure,
          ["from-green-900 via-green-800 to-green-950"]: isSuccess,
          ["from-gray-600 via-gray-400 to-gray-600"]: isOngoing,
        },
      )}
    >
      <Card {...forwardCardProps} />
    </div>
  );
}
