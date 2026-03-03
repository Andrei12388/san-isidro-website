"use client";

import { useState, useEffect } from "react";

export const URL =
  "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15";

export const getUsers =
  "https://isidro-webapi.onrender.com/users/?skip=0&limit=100";

export const tempUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=14.2&longitude=121.0&current_weather=true&hourly=temperature_2m";

export const authLoginApi = "https://isidro-webapi.onrender.com/api/auth/login";

// api/fetchdata.ts
export async function authLogin(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) throw new Error("Login failed");

  return await response.json();
}

//Old fetch method
// api/fetchdata.ts
export async function authLognOld(email: string, password: string) {
  try {
    const response = await fetch(authLoginApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err: any) {
    //  alert(err.message);
    throw new Error(err.message || "Unknown error");
  }
}

function SampleApi() {
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(getUsers);
        const datas = await response.json();
        setData(datas || []);

        setLoader(false);
      } catch (error: any) {
        console.error("Error fetching deals:", error);
        setErrMsg(error.message || "Unknown error");

        setError(true);
        setLoader(false);
      }
    };
    console.log("Fetching Users...", data);
    fetchUsers();
  }, []);

  return (
    <div>
      {loader ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading Data. {errMsg}</p>
      ) : (
        <div></div>
      )}
      {data?.map((item: any) => (
        <div key={item.id}>
          {item.name} {item.email}
        </div>
      ))}
    </div>
  );
}

export default SampleApi;
