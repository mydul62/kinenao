"use server"

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const GetAllHero= async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/hero/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next:{
      tags:["hero"]
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fblog get:", error);
    return null;
  }
};



export const updateHero = async (id:string,data: any) => {

  try {
    const token = (await cookies()).get("accessToken")?.value;
  
    if (!token) {
      throw new Error("Access token not found");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/hero/${id}/update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", 
          Authorization: token,   
        },
        body:  JSON.stringify(data)
, 
      }
    );

  revalidateTag("hero");
    return await response.json();
  } catch (error) {
    console.error("Error blog post:", error);
    return null;
  }
};


 