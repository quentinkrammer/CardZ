import classNames from "classnames";
import { ComponentProps, useState } from "react";

export function Table() {
  const [teamPlayerNumber, setTeamPlayernumber] = useState(2);

  return (
    <>
      <div className="grid h-full grid-cols-[repeat(3,1fr)] grid-rows-[repeat(3,1fr)] bg-green-800">
        <div className="col-[2/3] row-[2/3] place-self-center">center</div>
        <div className="col-[2/3] row-[3/4] place-self-center">me</div>
        {[...Array(teamPlayerNumber).keys()].map((teamPlayerIndex) => (
          <TeamPlayer
            teamPlayerNumber={teamPlayerIndex + 1}
            totalTeamPlayerNumber={teamPlayerNumber}
          />
        ))}
      </div>
    </>
  );
}
interface TeamPlayerProps extends ComponentProps<"div"> {
  teamPlayerNumber: number;
  totalTeamPlayerNumber: number;
}
function TeamPlayer({
  teamPlayerNumber,
  totalTeamPlayerNumber,
  className,
  ...otherProps
}: TeamPlayerProps) {
  const playerSpecificClasses = getTeamPlayerClassNames({
    teamPlayerNumber,
    totalTeamPlayerNumber,
  });

  return (
    <div
      {...otherProps}
      className={classNames(
        className,
        playerSpecificClasses?.className,
        "place-self-center",
      )}
    >{`Teamplayer #${teamPlayerNumber}`}</div>
  );
}
function getTeamPlayerClassNames({
  teamPlayerNumber,
  totalTeamPlayerNumber,
}: Pick<TeamPlayerProps, "teamPlayerNumber" | "totalTeamPlayerNumber">) {
  if (totalTeamPlayerNumber === 2) {
    if (teamPlayerNumber === 1) return { className: "col-[1/2] row-[1/2]" };
    if (teamPlayerNumber === 2) return { className: "col-[3/4] row-[1/2]" };
  }
  if (totalTeamPlayerNumber === 3) {
    if (teamPlayerNumber === 1) return { className: "col-[1/2] row-[2/3]" };
    if (teamPlayerNumber === 2) return { className: "col-[2/3] row-[1/2]" };
    if (teamPlayerNumber === 3) return { className: "col-[3/4] row-[2/3]" };
  }
}
