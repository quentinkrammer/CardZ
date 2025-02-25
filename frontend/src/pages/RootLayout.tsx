import { useState } from "react";
import { NavLink, Outlet, useParams } from "react-router";
import { trpc } from "../trpc";

export function RootLayout() {
  return (
    <div className="flex h-screen w-screen flex-col bg-radial from-gray-900 via-blue-800 to-blue-950 to-90% text-white">
      <Header />
      <main className="grow-1">
        <Outlet />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex justify-between p-1">
      <nav>
        <NavLink to="/">Home</NavLink>
      </nav>
      <Profile />
    </header>
  );
}

function Profile() {
  const params = useParams();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.user.getMyUserData.useQuery(undefined, {
    // TODO make global
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const [editMode, setEditMode] = useState(false);

  const name = data?.name ?? "";

  const setName = trpc.user.setName.useMutation({
    onSuccess: () => utils.user.getMyUserData.invalidate(),
    // TODO global error handling
  });

  return (
    <div>
      {!editMode && (
        <div onDoubleClick={() => setEditMode(true)}>
          {isLoading ? "updating..." : name}
        </div>
      )}
      {editMode && (
        <input
          placeholder={name}
          onBlur={(e) => {
            setName.mutate({
              name: e.target.value,
              lobbyId: params["lobbyId"],
            });
            setEditMode(false);
          }}
        />
      )}
    </div>
  );
}
