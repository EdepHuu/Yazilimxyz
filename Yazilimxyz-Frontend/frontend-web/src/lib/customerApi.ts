import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const api = axios.create({ baseURL: API_BASE });

export async function fetchListCategory() {
  const response = await api.get("/api/Category");
  return response.data;
}

export async function fetchListProduct() {
  const response = await api.get("/api/Product/get-active");
  return response.data;
}

export async function fetchListProductDetail(id:number) {
    const response=await api.get(`/api/Product/${id}`);
    return response.data;
}



// export async function fetchListFilter(){
//   const response =await api.get("/api/Product/Filter");
//   return response.data;
// }