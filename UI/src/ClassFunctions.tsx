import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext } from "react";
import { UserNameProvider } from "./App";
import "./App.css";
import { APIURL } from "./GeneralFunctions";

let userName = "";
export function UserName1() {
  const userNameProvider = useContext(UserNameProvider);
  userName = userNameProvider;
  console.log(userName);
  
  return <div></div>;
}

export async function createNewClass(className: string) {
  const form = new FormData();
  form.append("UserName", userName);
  form.append("ClassName", className);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/createclass`, requestOptions);
  var json = await response.json();
  console.log(json);
}

export async function getAllClasses() {
  const form = new FormData();
  form.append("UserName", userName);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/getallclasses`, requestOptions);
  var json = await response.json();
  console.log(json);
  return json["classes"]
}

export async function getRegisteredIds(
  className: string
) {
  const form = new FormData();
  form.append("UserName", userName);
  form.append("ClassName", className);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/getregisteredids`, requestOptions);
  var json = await response.json();
  return json["students"];
}

export async function registerStudentsToclass(
  className: string,
  selectedIds: string[]
) {
  const form = new FormData();
  form.append("UserName", userName);
  var personIds = selectedIds.join("---");
  form.append("UserName", userName);
  form.append("ClassName", className);
  form.append("PersonIds", personIds);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/adduserstoclass`, requestOptions);
  var json = await response.json();
  console.log(json);
}

export async function unregisterStudentsToclass(
  className: string,
  selectedIds: string[]
) {
  const form = new FormData();
  form.append("UserName", userName);
  var personIds = selectedIds.join("---");
  form.append("UserName", userName);
  form.append("ClassName", className);
  form.append("PersonIds", personIds);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/removeusersfromclass`, requestOptions);
  var json = await response.json();
  console.log(json);
}
