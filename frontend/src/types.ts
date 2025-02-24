import { GameState } from "backend";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Color = GameState["cards"][number]["color"];
