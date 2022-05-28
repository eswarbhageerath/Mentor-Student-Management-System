import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext } from "react";
import { UserNameProvider } from "../App/App";
import { APIURL } from "./GeneralFunctions";

let userName = "";
export function UserName1() {
  const userNameProvider = useContext(UserNameProvider);
  userName = userNameProvider;
  console.log(userName);

  return <div></div>;
}

// Function to call backend API to create new class
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

// Function to call backend API to get list of all classes created by current user
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
  return json["classes"];
}

// Function to call backend API to get list of registred ids in current class
export async function getRegisteredIds(className: string) {
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

// Function to call backend API to registed array of students to selected class
export async function registerStudentsToclass(
  className: string,
  selectedIds: string[]
) {
  const form = new FormData();
  form.append("UserName", userName);
  var personIds = selectedIds.join("---");
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

// Function to call backend API to unregisted array of students from the selected class
export async function unregisterStudentsToclass(
  className: string,
  selectedIds: string[]
) {
  const form = new FormData();
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

// Function to call backend API to mark all the students in the image
export async function markPresent(images: any, className: string) {
  var file = new File(images, "File");
  const form = new FormData();
  form.append("File", file);
  form.append("UserName", userName);
  form.append("ClassName", className);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/takeattendance`, requestOptions);
  var json = await response.json();

  console.log(json);
  return json;
}

// Function to call backend API to get attendance report of selected class in the form of json where keys are dates and values are array of names of the students attended on that day
export async function attendanceReport(className: string) {
  const form = new FormData();
  form.append("UserName", userName);
  form.append("ClassName", className);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/attendancereport`, requestOptions);
  var json = await response.json();
  console.log(json);
  return json;
}
