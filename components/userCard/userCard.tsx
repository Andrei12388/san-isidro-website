'use client'
import { useState, useEffect } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "../ui/button";
import { Icon } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UserCard() {
  const [users, setUser] = useState<User[]>([]);
  const [isDone, setIsDone] = useState(false);

  const userCard = async () => {
    try {
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/users",
        { cache: "no-store" }
      );

      const userss: User[] = await res.json();
      setUser(userss);
      console.log("Fetching Data Successfully!");
    } catch {
      console.log("error Fetching Data");
    } finally {
      setIsDone(true);
      console.log("Done fetching Data");
    }
  };

  useEffect(() => {
    userCard();
  }, []);

  return (
    <div className="flex flex-col  w-max">
      <ul>
        {users.map((user) => (
          <Item key={user.id} className="border border-solid border-black gap-5 my-5">
            <ItemMedia variant="icon">
            
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{user.name}</ItemTitle>
              <ItemDescription>{user.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button>Action</Button>
            </ItemActions>
          </Item>
        ))}
      </ul>
    </div>
  );
}
