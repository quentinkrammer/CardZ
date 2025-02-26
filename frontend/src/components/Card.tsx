import {
  fa0,
  fa1,
  fa2,
  fa3,
  fa4,
  fa5,
  fa6,
  fa7,
  fa8,
  fa9,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ComponentProps } from "react";
import { Color, Omit } from "../types";

const mapNUmberToSvg = {
  0: fa0,
  1: fa1,
  2: fa2,
  3: fa3,
  4: fa4,
  5: fa5,
  6: fa6,
  7: fa7,
  8: fa8,
  9: fa9,
};
const colorToTailwindClassMap: Record<Color, string> = {
  black: "from-gray-700 via-gray-500 to-gray-700",
  blue: "from-sky-700 via-sky-500 to-sky-700",
  green: "from-green-700 via-green-500 to-green-700",
  orange: "from-orange-700 via-orange-500 to-orange-700",
  red: "from-rose-700 via-rose-400 to-rose-700",
};

export interface CardProps extends ComponentProps<"div"> {
  value: number;
  cardColor: Color;
  iconProps?: Omit<FontAwesomeIconProps, "icon">;
}
export function Card({
  value,
  cardColor,
  className,
  iconProps = {},
  ...forwardProps
}: CardProps) {
  const color = colorToTailwindClassMap[cardColor];
  const {
    className: iconClassName,
    style: iconStyle,
    ...forwardIconProps
  } = iconProps;
  return (
    <div
      className={classNames(
        "aspect-[0.82] w-full max-w-20 rounded-md border-1 border-gray-300 bg-linear-to-br p-[clamp(2px,15%,16px)]",
        color,
        className,
      )}
      {...forwardProps}
    >
      <FontAwesomeIcon
        icon={
          mapNUmberToSvg[value as keyof typeof mapNUmberToSvg] ?? faQuestion
        }
        className={classNames(
          `text-gray-300 drop-shadow-[1px_1px_1px_rgba(0,0,0)]`,
          iconClassName,
        )}
        style={{
          height: "unset",
          verticalAlign: "unset",
          display: "block",
          ...iconStyle,
        }}
        {...forwardIconProps}
      />
    </div>
  );
}
