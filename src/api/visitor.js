import { API_BASE_URL } from "./config";

export const getVisitors = async () => {
  const response = await fetch(`${API_BASE_URL}/visitors`);
  if (!response.ok) {
    throw new Error("Failed to fetch visitors");
  }
  return response.json();
};

export const createVisitor = async (visitorData) => {
  const response = await fetch(`${API_BASE_URL}/visitors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(visitorData),
  });
  if (!response.ok) {
    throw new Error("Failed to create visitor");
  }
  return response.json();
};

export const updateVisitor = async (id, visitorData) => {
  const response = await fetch(`${API_BASE_URL}/visitors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(visitorData),
  });
  if (!response.ok) {
    throw new Error("Failed to update visitor");
  }
  return response.json();
};

export const deleteVisitor = async (id) => {
  const response = await fetch(`${API_BASE_URL}/visitors/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete visitor");
  }
  return response.json();
};

