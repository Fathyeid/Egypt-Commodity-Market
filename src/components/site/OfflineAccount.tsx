"use client";
import {useEffect} from "react";
export function OfflineAccount({owner}:{owner:string|null}){useEffect(()=>{(async()=>{try{const previous=localStorage.getItem("lisan-offline-owner");if(owner&&previous&&previous!==owner){await caches.delete("lisan-private-offline-v1");localStorage.removeItem("lisan-offline-owner");}if(owner)localStorage.setItem("lisan-offline-owner",owner);}catch{}})();},[owner]);return null;}
