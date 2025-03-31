import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useMyUserData } from "../hooks/useMyUserData";
import { trpc } from "../trpc";
import { Input } from "./Input";

export function MyUserName() {
  const params = useParams();
  const utils = trpc.useUtils();
  const { data, isFetching } = useMyUserData();
  const [editMode, setEditMode] = useState(false);
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (!ref) return;
    if (!editMode) return;
    ref.current.focus();
  }, [editMode]);

  const name = data?.name ?? "";

  const setName = trpc.user.setName.useMutation({
    onSuccess: () => utils.user.getMyUserData.invalidate(),
  });

  const onRename = (inputElement: HTMLInputElement) => {
    const value = inputElement.value;
    if (!value) return setEditMode(false);
    setName.mutate({
      name: inputElement.value,
      lobbyId: params["lobbyId"],
    });
    setEditMode(false);
  };

  return (
    <div className="cursor-pointer">
      {!editMode && (
        <div
          className="min-w-40 rounded bg-gray-900 p-2 hover:bg-gray-800"
          onClick={() => setEditMode(true)}
        >
          {isFetching ? "updating..." : name}
        </div>
      )}
      {editMode && (
        <Input
          ref={ref}
          placeholder={name}
          onBlur={(e) => onRename(e.target)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRename(e.currentTarget);
          }}
        />
      )}
    </div>
  );
}
