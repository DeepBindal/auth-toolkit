import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@nextui-org/react";

const Signinbutton = () => {
  const { data: session } = useSession();
  return (
    <div className="flex items-center gap-2">
      {session && session.user ? (
        <>
          <Link href="/profile">{session.user.name}</Link> <button onClick={()=>signOut()}>Signout</button>
        </>
      ) : (
        <Button onClick={() => signIn()}>Sign In</Button>
      )}
    </div>
  );
};

export default Signinbutton;
